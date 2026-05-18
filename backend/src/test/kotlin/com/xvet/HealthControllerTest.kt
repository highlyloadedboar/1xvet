package com.xvet

import org.junit.jupiter.api.Test
import org.springframework.test.web.servlet.get

class HealthControllerTest : BaseIntegrationTest() {
    @Test
    fun `should return status ok`() {
        mockMvc
            .get("/api/health")
            .andExpect {
                status { isOk() }
                jsonPath("$.status") { value("ok") }
                jsonPath("$.version") { value("0.0.1") }
            }
    }
}
