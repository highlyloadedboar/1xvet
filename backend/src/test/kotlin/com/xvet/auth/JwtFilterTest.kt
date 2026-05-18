package com.xvet.auth

import com.fasterxml.jackson.databind.ObjectMapper
import io.zonky.test.db.AutoConfigureEmbeddedDatabase
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@AutoConfigureEmbeddedDatabase
class JwtFilterTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `public endpoints are accessible without token`() {
        mockMvc.get("/api/health").andExpect { status { isOk() } }
    }

    @Test
    fun `protected endpoint returns 401 without token`() {
        mockMvc.get("/api/pets").andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `protected endpoint returns 401 with invalid token`() {
        mockMvc
            .get("/api/pets") {
                header("Authorization", "Bearer invalid.token.here")
            }.andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `protected endpoint is accessible with valid token`() {
        val token = registerAndGetToken()

        // /api/pets doesn't exist yet, but should get 404 (not 401)
        mockMvc
            .get("/api/pets") {
                header("Authorization", "Bearer $token")
            }.andExpect { status { isNotFound() } }
    }

    private fun registerAndGetToken(): String {
        val result =
            mockMvc
                .post("/api/auth/register") {
                    contentType = MediaType.APPLICATION_JSON
                    content =
                        """
                        {
                            "email": "jwt-test@example.com",
                            "password": "password123",
                            "firstName": "Test",
                            "lastName": "User",
                            "role": "OWNER"
                        }
                        """.trimIndent()
                }.andReturn()

        val json = objectMapper.readTree(result.response.contentAsString)
        return json["token"].asText()
    }
}
