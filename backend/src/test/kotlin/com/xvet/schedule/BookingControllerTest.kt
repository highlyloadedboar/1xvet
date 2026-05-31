package com.xvet.schedule

import com.xvet.BaseIntegrationTest
import org.hamcrest.CoreMatchers
import org.hamcrest.Matcher
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.time.temporal.ChronoUnit

class BookingControllerTest : BaseIntegrationTest() {
    @Autowired
    lateinit var vetSlotRepository: VetSlotRepository

    private data class Vet(
        val token: String,
        val slotId: Long,
    )

    private data class Owner(
        val token: String,
        val petId: Long,
    )

    private fun futureTime(days: Long = 1L): OffsetDateTime =
        OffsetDateTime.now(ZoneOffset.UTC).plusDays(days).truncatedTo(ChronoUnit.MINUTES)

    private fun registerOwnerWithPet(): Owner {
        val token = registerAndGetToken(role = "OWNER")
        val result =
            mockMvc
                .post("/api/pets") {
                    contentType = MediaType.APPLICATION_JSON
                    header("Authorization", "Bearer $token")
                    content = """{"name": "Барсик", "species": "CAT"}"""
                }.andReturn()
        val petId = objectMapper.readTree(result.response.contentAsString)["id"].asLong()
        return Owner(token, petId)
    }

    private fun registerVetWithSlot(time: OffsetDateTime = futureTime()): Vet {
        val token = registerAndGetToken(role = "VET")
        mockMvc.put("/api/vet/profile") {
            contentType = MediaType.APPLICATION_JSON
            header("Authorization", "Bearer $token")
            content = """{"specialty": "Терапия", "experienceYears": 5}"""
        }
        val result =
            mockMvc
                .post("/api/vet/slots") {
                    contentType = MediaType.APPLICATION_JSON
                    header("Authorization", "Bearer $token")
                    content = """{"startTime": "$time"}"""
                }.andReturn()
        val slotId = objectMapper.readTree(result.response.contentAsString)["id"].asLong()
        return Vet(token, slotId)
    }

    private fun bookSlot(
        ownerToken: String,
        slotId: Long,
        petId: Long? = null,
        reason: String? = null,
    ) = mockMvc.post("/api/appointments") {
        contentType = MediaType.APPLICATION_JSON
        header("Authorization", "Bearer $ownerToken")
        val petJson = if (petId != null) ""","petId": $petId""" else ""
        val reasonJson = if (reason != null) ""","reason": "$reason"""" else ""
        content = """{"slotId": $slotId$petJson$reasonJson}"""
    }

    @Nested
    inner class CreateAppointment {
        @Test
        fun `owner books slot with pet`() {
            val owner = registerOwnerWithPet()
            val vet = registerVetWithSlot()

            bookSlot(owner.token, vet.slotId, owner.petId, "Кашель уже неделю").andExpect {
                status { isCreated() }
                jsonPath("$.slotId") { value(vet.slotId) }
                jsonPath("$.ownerId") { value(notNull()) }
                jsonPath("$.petName") { value("Барсик") }
                jsonPath("$.reason") { value("Кашель уже неделю") }
                jsonPath("$.status") { value("BOOKED") }
            }
        }

        @Test
        fun `owner can book without pet`() {
            val owner = registerOwnerWithPet()
            val vet = registerVetWithSlot()

            val result =
                bookSlot(owner.token, vet.slotId)
                    .andExpect {
                        status { isCreated() }
                    }.andReturn()
            val json = objectMapper.readTree(result.response.contentAsString)
            val petIdNode = json["petId"]
            assert(petIdNode == null || petIdNode.isNull) {
                "petId should be absent or null when booking without pet"
            }
        }

        @Test
        fun `booking flips slot to booked`() {
            val owner = registerOwnerWithPet()
            val vet = registerVetWithSlot()
            bookSlot(owner.token, vet.slotId, owner.petId)

            val slot = vetSlotRepository.findById(vet.slotId).get()
            assert(slot.booked) { "slot should be marked booked after booking" }
        }

        @Test
        fun `403 when vet tries to book`() {
            val vet = registerVetWithSlot()
            val otherVet = registerVetWithSlot()
            bookSlot(otherVet.token, vet.slotId).andExpect {
                status { isForbidden() }
            }
        }

        @Test
        fun `404 when slot does not exist`() {
            val owner = registerOwnerWithPet()
            bookSlot(owner.token, 999_999L).andExpect {
                status { isNotFound() }
            }
        }

        @Test
        fun `404 when pet does not belong to owner`() {
            val owner1 = registerOwnerWithPet()
            val owner2 = registerOwnerWithPet()
            val vet = registerVetWithSlot()

            bookSlot(owner1.token, vet.slotId, owner2.petId).andExpect {
                status { isNotFound() }
            }
        }

        @Test
        fun `409 when slot is already booked`() {
            val owner1 = registerOwnerWithPet()
            val owner2 = registerOwnerWithPet()
            val vet = registerVetWithSlot()
            bookSlot(owner1.token, vet.slotId, owner1.petId)

            bookSlot(owner2.token, vet.slotId, owner2.petId).andExpect {
                status { isConflict() }
            }
        }

        @Test
        fun `401 without auth`() {
            mockMvc
                .post("/api/appointments") {
                    contentType = MediaType.APPLICATION_JSON
                    content = """{"slotId": 1}"""
                }.andExpect {
                    status { isUnauthorized() }
                }
        }
    }

    @Nested
    inner class ListMyAppointments {
        @Test
        fun `owner sees own bookings`() {
            val owner = registerOwnerWithPet()
            val vet = registerVetWithSlot()
            bookSlot(owner.token, vet.slotId, owner.petId)

            mockMvc
                .get("/api/appointments") { header("Authorization", "Bearer ${owner.token}") }
                .andExpect {
                    status { isOk() }
                    jsonPath("$.length()") { value(1) }
                    jsonPath("$[0].slotId") { value(vet.slotId) }
                }
        }

        @Test
        fun `vet sees bookings made for their slots`() {
            val owner = registerOwnerWithPet()
            val vet = registerVetWithSlot()
            bookSlot(owner.token, vet.slotId, owner.petId)

            mockMvc
                .get("/api/appointments") { header("Authorization", "Bearer ${vet.token}") }
                .andExpect {
                    status { isOk() }
                    jsonPath("$.length()") { value(1) }
                    jsonPath("$[0].slotId") { value(vet.slotId) }
                }
        }

        @Test
        fun `does not see other users' appointments`() {
            val owner1 = registerOwnerWithPet()
            val owner2 = registerOwnerWithPet()
            val vet1 = registerVetWithSlot()
            val vet2 = registerVetWithSlot()
            bookSlot(owner1.token, vet1.slotId, owner1.petId)
            bookSlot(owner2.token, vet2.slotId, owner2.petId)

            mockMvc
                .get("/api/appointments") { header("Authorization", "Bearer ${owner1.token}") }
                .andExpect {
                    status { isOk() }
                    jsonPath("$.length()") { value(1) }
                }
        }

        @Test
        fun `401 without auth`() {
            mockMvc.get("/api/appointments").andExpect { status { isUnauthorized() } }
        }
    }

    @Nested
    inner class CancelAppointment {
        private fun book(): Triple<Owner, Vet, Long> {
            val owner = registerOwnerWithPet()
            val vet = registerVetWithSlot()
            val result = bookSlot(owner.token, vet.slotId, owner.petId).andReturn()
            val apptId = objectMapper.readTree(result.response.contentAsString)["id"].asLong()
            return Triple(owner, vet, apptId)
        }

        @Test
        fun `owner can cancel own appointment`() {
            val (owner, vet, apptId) = book()

            mockMvc
                .post("/api/appointments/$apptId/cancel") {
                    header("Authorization", "Bearer ${owner.token}")
                }.andExpect {
                    status { isOk() }
                    jsonPath("$.status") { value("CANCELLED") }
                }

            val slot = vetSlotRepository.findById(vet.slotId).get()
            assert(!slot.booked) { "slot should be released after cancellation" }
        }

        @Test
        fun `vet can cancel appointment for their slot`() {
            val (_, vet, apptId) = book()

            mockMvc
                .post("/api/appointments/$apptId/cancel") {
                    header("Authorization", "Bearer ${vet.token}")
                }.andExpect {
                    status { isOk() }
                    jsonPath("$.status") { value("CANCELLED") }
                }
        }

        @Test
        fun `cancel is idempotent`() {
            val (owner, _, apptId) = book()

            mockMvc.post("/api/appointments/$apptId/cancel") {
                header("Authorization", "Bearer ${owner.token}")
            }
            mockMvc
                .post("/api/appointments/$apptId/cancel") {
                    header("Authorization", "Bearer ${owner.token}")
                }.andExpect {
                    status { isOk() }
                    jsonPath("$.status") { value("CANCELLED") }
                }
        }

        @Test
        fun `404 when caller is neither owner nor vet`() {
            val (_, _, apptId) = book()
            val outsider = registerAndGetToken(role = "OWNER")

            mockMvc
                .post("/api/appointments/$apptId/cancel") {
                    header("Authorization", "Bearer $outsider")
                }.andExpect {
                    status { isNotFound() }
                }
        }

        @Test
        fun `404 when appointment does not exist`() {
            val owner = registerOwnerWithPet()
            mockMvc
                .post("/api/appointments/999999/cancel") {
                    header("Authorization", "Bearer ${owner.token}")
                }.andExpect {
                    status { isNotFound() }
                }
        }

        @Test
        fun `401 without auth`() {
            mockMvc.post("/api/appointments/1/cancel").andExpect { status { isUnauthorized() } }
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun notNull(): Matcher<Any> = CoreMatchers.notNullValue() as Matcher<Any>
}
