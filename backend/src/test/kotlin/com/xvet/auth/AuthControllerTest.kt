package com.xvet.auth

import io.zonky.test.db.AutoConfigureEmbeddedDatabase
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@AutoConfigureEmbeddedDatabase
class AuthControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    private fun registerUser(
        email: String,
        password: String = "password123",
        firstName: String = "Test",
        lastName: String = "User",
        role: String = "OWNER",
    ) = mockMvc.post("/api/auth/register") {
        contentType = MediaType.APPLICATION_JSON
        content =
            """
            {
                "email": "$email",
                "password": "$password",
                "firstName": "$firstName",
                "lastName": "$lastName",
                "role": "$role"
            }
            """.trimIndent()
    }

    private fun loginUser(
        email: String,
        password: String = "password123",
    ) = mockMvc.post("/api/auth/login") {
        contentType = MediaType.APPLICATION_JSON
        content =
            """
            {
                "email": "$email",
                "password": "$password"
            }
            """.trimIndent()
    }

    @Test
    fun `register returns 201 with token and user info`() {
        registerUser("register@example.com", firstName = "Иван", lastName = "Петров")
            .andExpect {
                status { isCreated() }
                jsonPath("$.token") { isNotEmpty() }
                jsonPath("$.user.email") { value("register@example.com") }
                jsonPath("$.user.firstName") { value("Иван") }
                jsonPath("$.user.lastName") { value("Петров") }
                jsonPath("$.user.role") { value("OWNER") }
                jsonPath("$.user.id") { isNumber() }
            }
    }

    @Test
    fun `register with duplicate email returns 409`() {
        registerUser("duplicate@example.com").andExpect { status { isCreated() } }
        registerUser("duplicate@example.com").andExpect {
            status { isConflict() }
            jsonPath("$.message") { isNotEmpty() }
        }
    }

    @Test
    fun `login with valid credentials returns token`() {
        registerUser("login@example.com", role = "VET")
        loginUser("login@example.com").andExpect {
            status { isOk() }
            jsonPath("$.token") { isNotEmpty() }
            jsonPath("$.user.email") { value("login@example.com") }
            jsonPath("$.user.role") { value("VET") }
        }
    }

    @Test
    fun `login with wrong password returns 401`() {
        registerUser("wrongpass@example.com")
        loginUser("wrongpass@example.com", password = "wrong").andExpect {
            status { isUnauthorized() }
            jsonPath("$.message") { isNotEmpty() }
        }
    }

    @Test
    fun `login with non-existent email returns 401`() {
        loginUser("nobody@example.com").andExpect {
            status { isUnauthorized() }
        }
    }
}
