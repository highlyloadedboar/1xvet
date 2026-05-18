package com.xvet.pet

import com.xvet.BaseIntegrationTest
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put

class PetControllerTest : BaseIntegrationTest() {
    private fun createPet(
        token: String,
        name: String = "Барсик",
        species: String = "CAT",
    ) = mockMvc.post("/api/pets") {
        contentType = MediaType.APPLICATION_JSON
        header("Authorization", "Bearer $token")
        content =
            """
            {
                "name": "$name",
                "species": "$species",
                "breed": "Британская",
                "weight": 4.5
            }
            """.trimIndent()
    }

    private fun extractPetId(result: org.springframework.test.web.servlet.MvcResult): Long {
        val json = objectMapper.readTree(result.response.contentAsString)
        return json["id"].asLong()
    }

    @Nested
    inner class CreatePet {
        @Test
        fun `should create pet for authenticated owner`() {
            val token = registerAndGetToken()
            createPet(token).andExpect {
                status { isCreated() }
                jsonPath("$.name") { value("Барсик") }
                jsonPath("$.species") { value("CAT") }
                jsonPath("$.breed") { value("Британская") }
                jsonPath("$.weight") { value(4.5) }
            }
        }

        @Test
        fun `should return 401 without token`() {
            mockMvc
                .post("/api/pets") {
                    contentType = MediaType.APPLICATION_JSON
                    content = """{"name": "Барсик", "species": "CAT"}"""
                }.andExpect {
                    status { isUnauthorized() }
                }
        }
    }

    @Nested
    inner class GetMyPets {
        @Test
        fun `should return empty list when no pets`() {
            val token = registerAndGetToken()
            mockMvc
                .get("/api/pets") {
                    header("Authorization", "Bearer $token")
                }.andExpect {
                    status { isOk() }
                    jsonPath("$.length()") { value(0) }
                }
        }

        @Test
        fun `should return only own pets`() {
            val token1 = registerAndGetToken()
            val token2 = registerAndGetToken()
            createPet(token1, name = "Барсик")
            createPet(token2, name = "Шарик", species = "DOG")

            mockMvc
                .get("/api/pets") {
                    header("Authorization", "Bearer $token1")
                }.andExpect {
                    status { isOk() }
                    jsonPath("$.length()") { value(1) }
                    jsonPath("$[0].name") { value("Барсик") }
                }
        }
    }

    @Nested
    inner class GetPet {
        @Test
        fun `should return pet by id`() {
            val token = registerAndGetToken()
            val result = createPet(token).andReturn()
            val petId = extractPetId(result)

            mockMvc
                .get("/api/pets/$petId") {
                    header("Authorization", "Bearer $token")
                }.andExpect {
                    status { isOk() }
                    jsonPath("$.name") { value("Барсик") }
                }
        }

        @Test
        fun `should return 404 for other user pet`() {
            val token1 = registerAndGetToken()
            val token2 = registerAndGetToken()
            val result = createPet(token1).andReturn()
            val petId = extractPetId(result)

            mockMvc
                .get("/api/pets/$petId") {
                    header("Authorization", "Bearer $token2")
                }.andExpect {
                    status { isNotFound() }
                }
        }
    }

    @Nested
    inner class UpdatePet {
        @Test
        fun `should update pet`() {
            val token = registerAndGetToken()
            val result = createPet(token).andReturn()
            val petId = extractPetId(result)

            mockMvc
                .put("/api/pets/$petId") {
                    contentType = MediaType.APPLICATION_JSON
                    header("Authorization", "Bearer $token")
                    content = """{"name": "Мурзик", "weight": 5.0}"""
                }.andExpect {
                    status { isOk() }
                    jsonPath("$.name") { value("Мурзик") }
                    jsonPath("$.weight") { value(5.0) }
                    jsonPath("$.species") { value("CAT") }
                }
        }
    }

    @Nested
    inner class DeletePet {
        @Test
        fun `should delete pet`() {
            val token = registerAndGetToken()
            val result = createPet(token).andReturn()
            val petId = extractPetId(result)

            mockMvc
                .delete("/api/pets/$petId") {
                    header("Authorization", "Bearer $token")
                }.andExpect {
                    status { isNoContent() }
                }

            mockMvc
                .get("/api/pets/$petId") {
                    header("Authorization", "Bearer $token")
                }.andExpect {
                    status { isNotFound() }
                }
        }
    }
}
