package com.xvet

import com.fasterxml.jackson.databind.ObjectMapper
import io.zonky.test.db.AutoConfigureEmbeddedDatabase
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@AutoConfigureEmbeddedDatabase
@Transactional
abstract class BaseIntegrationTest {
    @Autowired
    lateinit var mockMvc: MockMvc

    @Autowired
    lateinit var objectMapper: ObjectMapper

    fun randomEmail(): String = "test-${UUID.randomUUID()}@example.com"

    fun registerUser(
        email: String = randomEmail(),
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

    fun loginUser(
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

    fun registerAndGetToken(
        email: String = randomEmail(),
        role: String = "OWNER",
    ): String {
        val result =
            registerUser(email = email, role = role).andReturn()
        val json = objectMapper.readTree(result.response.contentAsString)
        return json["token"].asText()
    }
}
