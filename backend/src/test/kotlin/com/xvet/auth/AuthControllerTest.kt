package com.xvet.auth

import com.xvet.BaseIntegrationTest
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class AuthControllerTest : BaseIntegrationTest() {
    @Nested
    inner class Register {
        @Test
        fun `should return 201 with token and user info`() {
            val email = randomEmail()
            registerUser(email = email, firstName = "Иван", lastName = "Петров")
                .andExpect {
                    status { isCreated() }
                    jsonPath("$.token") { isNotEmpty() }
                    jsonPath("$.user.email") { value(email) }
                    jsonPath("$.user.firstName") { value("Иван") }
                    jsonPath("$.user.lastName") { value("Петров") }
                    jsonPath("$.user.role") { value("OWNER") }
                    jsonPath("$.user.id") { isNumber() }
                }
        }

        @Test
        fun `should return 409 when email already exists`() {
            val email = randomEmail()
            registerUser(email = email)
            registerUser(email = email).andExpect {
                status { isConflict() }
                jsonPath("$.message") { isNotEmpty() }
            }
        }
    }

    @Nested
    inner class Login {
        @Test
        fun `should return token when credentials are valid`() {
            val email = randomEmail()
            registerUser(email = email, role = "VET")
            loginUser(email).andExpect {
                status { isOk() }
                jsonPath("$.token") { isNotEmpty() }
                jsonPath("$.user.email") { value(email) }
                jsonPath("$.user.role") { value("VET") }
            }
        }

        @Test
        fun `should return 401 when password is wrong`() {
            val email = randomEmail()
            registerUser(email = email)
            loginUser(email, password = "wrong").andExpect {
                status { isUnauthorized() }
                jsonPath("$.message") { isNotEmpty() }
            }
        }

        @Test
        fun `should return 401 when email does not exist`() {
            loginUser(randomEmail()).andExpect {
                status { isUnauthorized() }
            }
        }
    }
}
