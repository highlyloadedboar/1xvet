package com.xvet.auth

import com.xvet.BaseIntegrationTest
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.test.web.servlet.get

class JwtFilterTest : BaseIntegrationTest() {
    @Nested
    inner class PublicEndpoints {
        @Test
        fun `should be accessible without token`() {
            mockMvc.get("/api/health").andExpect { status { isOk() } }
        }
    }

    @Nested
    inner class ProtectedEndpoints {
        @Test
        fun `should return 401 without token`() {
            mockMvc.get("/api/pets").andExpect { status { isUnauthorized() } }
        }

        @Test
        fun `should return 401 with invalid token`() {
            mockMvc
                .get("/api/pets") {
                    header("Authorization", "Bearer invalid.token.here")
                }.andExpect { status { isUnauthorized() } }
        }

        @Test
        fun `should pass with valid token`() {
            val token = registerAndGetToken()
            mockMvc
                .get("/api/pets") {
                    header("Authorization", "Bearer $token")
                }.andExpect { status { isOk() } }
        }
    }
}
