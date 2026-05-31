package com.xvet.schedule

import com.xvet.BaseIntegrationTest
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.time.temporal.ChronoUnit

class VetSlotControllerTest : BaseIntegrationTest() {
    @Autowired
    lateinit var vetSlotRepository: VetSlotRepository

    private fun futureTime(daysFromNow: Long = 1L): OffsetDateTime =
        OffsetDateTime.now(ZoneOffset.UTC).plusDays(daysFromNow).truncatedTo(ChronoUnit.MINUTES)

    private fun setUpVetWithProfile(): String {
        val token = registerAndGetToken(role = "VET")
        mockMvc.put("/api/vet/profile") {
            contentType = MediaType.APPLICATION_JSON
            header("Authorization", "Bearer $token")
            content = """{"specialty": "Терапия", "experienceYears": 5}"""
        }
        return token
    }

    private fun vetProfileId(token: String): Long {
        val result =
            mockMvc
                .get("/api/vet/profile") {
                    header("Authorization", "Bearer $token")
                }.andReturn()
        return objectMapper.readTree(result.response.contentAsString)["id"].asLong()
    }

    private fun createSlot(
        token: String,
        startTime: OffsetDateTime,
    ) = mockMvc.post("/api/vet/slots") {
        contentType = MediaType.APPLICATION_JSON
        header("Authorization", "Bearer $token")
        content = """{"startTime": "$startTime"}"""
    }

    @Nested
    inner class CreateSlot {
        @Test
        fun `vet with profile can create a future slot`() {
            val token = setUpVetWithProfile()
            val time = futureTime()
            createSlot(token, time).andExpect {
                status { isCreated() }
                jsonPath("$.booked") { value(false) }
            }
        }

        @Test
        fun `400 when start_time is in the past`() {
            val token = setUpVetWithProfile()
            val pastTime = OffsetDateTime.now(ZoneOffset.UTC).minusDays(1).truncatedTo(ChronoUnit.MINUTES)
            createSlot(token, pastTime).andExpect {
                status { isBadRequest() }
            }
        }

        @Test
        fun `404 when vet has no profile yet`() {
            val token = registerAndGetToken(role = "VET")
            createSlot(token, futureTime()).andExpect {
                status { isNotFound() }
            }
        }

        @Test
        fun `409 when slot at same time already exists`() {
            val token = setUpVetWithProfile()
            val time = futureTime()
            createSlot(token, time)
            createSlot(token, time).andExpect {
                status { isConflict() }
            }
        }

        @Test
        fun `401 without auth`() {
            mockMvc
                .post("/api/vet/slots") {
                    contentType = MediaType.APPLICATION_JSON
                    content = """{"startTime": "${futureTime()}"}"""
                }.andExpect {
                    status { isUnauthorized() }
                }
        }
    }

    @Nested
    inner class ListMySlots {
        @Test
        fun `returns only caller's slots`() {
            val token1 = setUpVetWithProfile()
            val token2 = setUpVetWithProfile()
            createSlot(token1, futureTime(1))
            createSlot(token1, futureTime(2))
            createSlot(token2, futureTime(3))

            mockMvc
                .get("/api/vet/slots") { header("Authorization", "Bearer $token1") }
                .andExpect {
                    status { isOk() }
                    jsonPath("$.length()") { value(2) }
                }
        }

        @Test
        fun `empty list when no slots`() {
            val token = setUpVetWithProfile()
            mockMvc
                .get("/api/vet/slots") { header("Authorization", "Bearer $token") }
                .andExpect {
                    status { isOk() }
                    jsonPath("$.length()") { value(0) }
                }
        }

        @Test
        fun `401 without auth`() {
            mockMvc.get("/api/vet/slots").andExpect { status { isUnauthorized() } }
        }
    }

    @Nested
    inner class DeleteSlot {
        @Test
        fun `vet can delete own slot`() {
            val token = setUpVetWithProfile()
            val result = createSlot(token, futureTime()).andReturn()
            val slotId = objectMapper.readTree(result.response.contentAsString)["id"].asLong()

            mockMvc
                .delete("/api/vet/slots/$slotId") {
                    header("Authorization", "Bearer $token")
                }.andExpect {
                    status { isNoContent() }
                }
        }

        @Test
        fun `404 for non-existent slot`() {
            val token = setUpVetWithProfile()
            mockMvc
                .delete("/api/vet/slots/999999") {
                    header("Authorization", "Bearer $token")
                }.andExpect {
                    status { isNotFound() }
                }
        }

        @Test
        fun `404 when slot belongs to another vet`() {
            val token1 = setUpVetWithProfile()
            val token2 = setUpVetWithProfile()
            val result = createSlot(token1, futureTime()).andReturn()
            val slotId = objectMapper.readTree(result.response.contentAsString)["id"].asLong()

            mockMvc
                .delete("/api/vet/slots/$slotId") {
                    header("Authorization", "Bearer $token2")
                }.andExpect {
                    status { isNotFound() }
                }
        }

        @Test
        fun `409 when slot is booked`() {
            val token = setUpVetWithProfile()
            val result = createSlot(token, futureTime()).andReturn()
            val slotId = objectMapper.readTree(result.response.contentAsString)["id"].asLong()
            val slot = vetSlotRepository.findById(slotId).get()
            slot.booked = true
            vetSlotRepository.save(slot)

            mockMvc
                .delete("/api/vet/slots/$slotId") {
                    header("Authorization", "Bearer $token")
                }.andExpect {
                    status { isConflict() }
                }
        }

        @Test
        fun `401 without auth`() {
            mockMvc.delete("/api/vet/slots/1").andExpect { status { isUnauthorized() } }
        }
    }

    @Nested
    inner class ListPublicSlots {
        @Test
        fun `returns vet's available slots without auth`() {
            val token = setUpVetWithProfile()
            createSlot(token, futureTime(1))
            createSlot(token, futureTime(2))
            val profileId = vetProfileId(token)

            mockMvc
                .get("/api/vets/$profileId/slots")
                .andExpect {
                    status { isOk() }
                    jsonPath("$.length()") { value(2) }
                }
        }

        @Test
        fun `excludes booked slots`() {
            val token = setUpVetWithProfile()
            val result = createSlot(token, futureTime(1)).andReturn()
            createSlot(token, futureTime(2))
            val bookedId = objectMapper.readTree(result.response.contentAsString)["id"].asLong()
            val slot = vetSlotRepository.findById(bookedId).get()
            slot.booked = true
            vetSlotRepository.save(slot)

            val profileId = vetProfileId(token)
            mockMvc
                .get("/api/vets/$profileId/slots")
                .andExpect {
                    status { isOk() }
                    jsonPath("$.length()") { value(1) }
                }
        }

        @Test
        fun `respects from and to query params`() {
            val token = setUpVetWithProfile()
            createSlot(token, futureTime(2))
            createSlot(token, futureTime(40))
            val profileId = vetProfileId(token)
            val from = OffsetDateTime.now(ZoneOffset.UTC)
            val to = from.plusDays(10)

            mockMvc
                .get("/api/vets/$profileId/slots") {
                    param("from", from.toString())
                    param("to", to.toString())
                }.andExpect {
                    status { isOk() }
                    jsonPath("$.length()") { value(1) }
                }
        }

        @Test
        fun `404 when vet profile does not exist`() {
            mockMvc
                .get("/api/vets/999999/slots")
                .andExpect {
                    status { isNotFound() }
                }
        }
    }
}
