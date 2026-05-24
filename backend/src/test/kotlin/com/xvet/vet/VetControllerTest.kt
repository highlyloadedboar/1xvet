package com.xvet.vet

import com.xvet.BaseIntegrationTest
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.put

class VetControllerTest : BaseIntegrationTest() {
    private fun updateVetProfile(
        token: String,
        specialty: String = "Терапия",
        experienceYears: Int = 5,
    ) = mockMvc.put("/api/vet/profile") {
        contentType = MediaType.APPLICATION_JSON
        header("Authorization", "Bearer $token")
        content =
            """
            {
                "specialty": "$specialty",
                "experienceYears": $experienceYears,
                "description": "Опытный ветеринар",
                "education": "МГАВМиБ",
                "priceRub": 2000,
                "available": true
            }
            """.trimIndent()
    }

    @Nested
    inner class GetMyProfile {
        @Test
        fun `should return 404 when profile does not exist`() {
            val token = registerAndGetToken(role = "VET")
            mockMvc
                .get("/api/vet/profile") {
                    header("Authorization", "Bearer $token")
                }.andExpect {
                    status { isNotFound() }
                }
        }

        @Test
        fun `should return profile after creation`() {
            val token = registerAndGetToken(role = "VET")
            updateVetProfile(token)

            mockMvc
                .get("/api/vet/profile") {
                    header("Authorization", "Bearer $token")
                }.andExpect {
                    status { isOk() }
                    jsonPath("$.specialty") { value("Терапия") }
                    jsonPath("$.experienceYears") { value(5) }
                    jsonPath("$.firstName") { value("Test") }
                    jsonPath("$.lastName") { value("User") }
                }
        }

        @Test
        fun `should return 401 without token`() {
            mockMvc
                .get("/api/vet/profile")
                .andExpect {
                    status { isUnauthorized() }
                }
        }
    }

    @Nested
    inner class UpdateProfile {
        @Test
        fun `should create profile on first update`() {
            val token = registerAndGetToken(role = "VET")
            updateVetProfile(token).andExpect {
                status { isOk() }
                jsonPath("$.specialty") { value("Терапия") }
                jsonPath("$.experienceYears") { value(5) }
                jsonPath("$.priceRub") { value(2000) }
                jsonPath("$.available") { value(true) }
            }
        }

        @Test
        fun `should update existing profile`() {
            val token = registerAndGetToken(role = "VET")
            updateVetProfile(token)

            mockMvc
                .put("/api/vet/profile") {
                    contentType = MediaType.APPLICATION_JSON
                    header("Authorization", "Bearer $token")
                    content = """{"specialty": "Хирургия", "experienceYears": 10}"""
                }.andExpect {
                    status { isOk() }
                    jsonPath("$.specialty") { value("Хирургия") }
                    jsonPath("$.experienceYears") { value(10) }
                    jsonPath("$.priceRub") { value(2000) }
                }
        }
    }

    @Nested
    inner class SearchVets {
        @Test
        fun `should return all vets`() {
            val token1 = registerAndGetToken(role = "VET")
            val token2 = registerAndGetToken(role = "VET")
            updateVetProfile(token1, specialty = "Терапия")
            updateVetProfile(token2, specialty = "Хирургия")

            mockMvc
                .get("/api/vets")
                .andExpect {
                    status { isOk() }
                    jsonPath("$.length()") { value(2) }
                }
        }

        @Test
        fun `should filter by specialty`() {
            val token1 = registerAndGetToken(role = "VET")
            val token2 = registerAndGetToken(role = "VET")
            updateVetProfile(token1, specialty = "Терапия")
            updateVetProfile(token2, specialty = "Хирургия")

            mockMvc
                .get("/api/vets") {
                    param("specialty", "Терапия")
                }.andExpect {
                    status { isOk() }
                    jsonPath("$.length()") { value(1) }
                    jsonPath("$[0].specialty") { value("Терапия") }
                }
        }

        @Test
        fun `should filter by available`() {
            val token1 = registerAndGetToken(role = "VET")
            val token2 = registerAndGetToken(role = "VET")
            updateVetProfile(token1)

            mockMvc
                .put("/api/vet/profile") {
                    contentType = MediaType.APPLICATION_JSON
                    header("Authorization", "Bearer $token2")
                    content = """{"specialty": "Хирургия", "available": false}"""
                }

            mockMvc
                .get("/api/vets") {
                    param("available", "true")
                }.andExpect {
                    status { isOk() }
                    jsonPath("$.length()") { value(1) }
                }
        }

        @Test
        fun `should be accessible without auth`() {
            mockMvc
                .get("/api/vets")
                .andExpect {
                    status { isOk() }
                }
        }
    }

    @Nested
    inner class GetVetById {
        @Test
        fun `should return vet by id`() {
            val token = registerAndGetToken(role = "VET")
            val result = updateVetProfile(token).andReturn()
            val vetId = objectMapper.readTree(result.response.contentAsString)["id"].asLong()

            mockMvc
                .get("/api/vets/$vetId")
                .andExpect {
                    status { isOk() }
                    jsonPath("$.specialty") { value("Терапия") }
                }
        }

        @Test
        fun `should return 404 for non-existent vet`() {
            mockMvc
                .get("/api/vets/999")
                .andExpect {
                    status { isNotFound() }
                }
        }

        @Test
        fun `should be accessible without auth`() {
            val token = registerAndGetToken(role = "VET")
            val result = updateVetProfile(token).andReturn()
            val vetId = objectMapper.readTree(result.response.contentAsString)["id"].asLong()

            mockMvc
                .get("/api/vets/$vetId")
                .andExpect {
                    status { isOk() }
                }
        }
    }
}
