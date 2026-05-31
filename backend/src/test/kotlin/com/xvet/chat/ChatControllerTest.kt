package com.xvet.chat

import com.xvet.BaseIntegrationTest
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

class ChatControllerTest : BaseIntegrationTest() {
    private data class Account(
        val token: String,
        val id: Long,
    )

    private fun registerAccount(role: String): Account {
        val result = registerUser(role = role).andReturn()
        val json = objectMapper.readTree(result.response.contentAsString)
        return Account(token = json["token"].asText(), id = json["user"]["id"].asLong())
    }

    private fun ownerAndVet(): Pair<Account, Account> = registerAccount("OWNER") to registerAccount("VET")

    private fun createConversation(
        token: String,
        otherUserId: Long,
    ) = mockMvc.post("/api/conversations") {
        contentType = MediaType.APPLICATION_JSON
        header("Authorization", "Bearer $token")
        content = """{"otherUserId": $otherUserId}"""
    }

    private fun conversationId(
        token: String,
        otherUserId: Long,
    ): Long {
        val result = createConversation(token, otherUserId).andReturn()
        return objectMapper.readTree(result.response.contentAsString)["id"].asLong()
    }

    @Nested
    inner class CreateConversation {
        @Test
        fun `owner can start conversation with vet`() {
            val (owner, vet) = ownerAndVet()
            createConversation(owner.token, vet.id).andExpect {
                status { isOk() }
                jsonPath("$.ownerId") { value(owner.id) }
                jsonPath("$.vetId") { value(vet.id) }
            }
        }

        @Test
        fun `vet can start conversation with owner`() {
            val (owner, vet) = ownerAndVet()
            createConversation(vet.token, owner.id).andExpect {
                status { isOk() }
                jsonPath("$.ownerId") { value(owner.id) }
                jsonPath("$.vetId") { value(vet.id) }
            }
        }

        @Test
        fun `is idempotent - returns existing conversation`() {
            val (owner, vet) = ownerAndVet()
            val first = conversationId(owner.token, vet.id)
            val second = conversationId(vet.token, owner.id)
            assert(first == second) { "expected same conversation id, got $first and $second" }
        }

        @Test
        fun `400 when two owners try to chat`() {
            val owner1 = registerAccount("OWNER")
            val owner2 = registerAccount("OWNER")
            createConversation(owner1.token, owner2.id).andExpect {
                status { isBadRequest() }
            }
        }

        @Test
        fun `400 when two vets try to chat`() {
            val vet1 = registerAccount("VET")
            val vet2 = registerAccount("VET")
            createConversation(vet1.token, vet2.id).andExpect {
                status { isBadRequest() }
            }
        }

        @Test
        fun `400 when starting with self`() {
            val owner = registerAccount("OWNER")
            createConversation(owner.token, owner.id).andExpect {
                status { isBadRequest() }
            }
        }

        @Test
        fun `404 when other user does not exist`() {
            val owner = registerAccount("OWNER")
            createConversation(owner.token, 999_999L).andExpect {
                status { isNotFound() }
            }
        }

        @Test
        fun `401 without auth`() {
            mockMvc
                .post("/api/conversations") {
                    contentType = MediaType.APPLICATION_JSON
                    content = """{"otherUserId": 1}"""
                }.andExpect {
                    status { isUnauthorized() }
                }
        }
    }

    @Nested
    inner class ListConversations {
        @Test
        fun `lists conversations where caller is owner`() {
            val (owner, vet) = ownerAndVet()
            conversationId(owner.token, vet.id)

            mockMvc
                .get("/api/conversations") { header("Authorization", "Bearer ${owner.token}") }
                .andExpect {
                    status { isOk() }
                    jsonPath("$.length()") { value(1) }
                    jsonPath("$[0].vetId") { value(vet.id) }
                }
        }

        @Test
        fun `lists conversations where caller is vet`() {
            val (owner, vet) = ownerAndVet()
            conversationId(owner.token, vet.id)

            mockMvc
                .get("/api/conversations") { header("Authorization", "Bearer ${vet.token}") }
                .andExpect {
                    status { isOk() }
                    jsonPath("$.length()") { value(1) }
                    jsonPath("$[0].ownerId") { value(owner.id) }
                }
        }

        @Test
        fun `does not include conversations of other users`() {
            val (owner1, vet1) = ownerAndVet()
            val (owner2, vet2) = ownerAndVet()
            conversationId(owner1.token, vet1.id)
            conversationId(owner2.token, vet2.id)

            mockMvc
                .get("/api/conversations") { header("Authorization", "Bearer ${owner1.token}") }
                .andExpect {
                    status { isOk() }
                    jsonPath("$.length()") { value(1) }
                    jsonPath("$[0].vetId") { value(vet1.id) }
                }
        }

        @Test
        fun `401 without auth`() {
            mockMvc.get("/api/conversations").andExpect { status { isUnauthorized() } }
        }
    }

    @Nested
    inner class SendMessage {
        @Test
        fun `owner participant can send message`() {
            val (owner, vet) = ownerAndVet()
            val convId = conversationId(owner.token, vet.id)

            mockMvc
                .post("/api/conversations/$convId/messages") {
                    contentType = MediaType.APPLICATION_JSON
                    header("Authorization", "Bearer ${owner.token}")
                    content = """{"content": "Здравствуйте, доктор"}"""
                }.andExpect {
                    status { isCreated() }
                    jsonPath("$.content") { value("Здравствуйте, доктор") }
                    jsonPath("$.senderId") { value(owner.id) }
                    jsonPath("$.conversationId") { value(convId) }
                }
        }

        @Test
        fun `vet participant can send message`() {
            val (owner, vet) = ownerAndVet()
            val convId = conversationId(owner.token, vet.id)

            mockMvc
                .post("/api/conversations/$convId/messages") {
                    contentType = MediaType.APPLICATION_JSON
                    header("Authorization", "Bearer ${vet.token}")
                    content = """{"content": "Здравствуйте"}"""
                }.andExpect {
                    status { isCreated() }
                    jsonPath("$.senderId") { value(vet.id) }
                }
        }

        @Test
        fun `404 when non-participant tries to send`() {
            val (owner, vet) = ownerAndVet()
            val convId = conversationId(owner.token, vet.id)
            val outsider = registerAccount("OWNER")

            mockMvc
                .post("/api/conversations/$convId/messages") {
                    contentType = MediaType.APPLICATION_JSON
                    header("Authorization", "Bearer ${outsider.token}")
                    content = """{"content": "Hi"}"""
                }.andExpect {
                    status { isNotFound() }
                }
        }

        @Test
        fun `404 when conversation does not exist`() {
            val owner = registerAccount("OWNER")
            mockMvc
                .post("/api/conversations/999999/messages") {
                    contentType = MediaType.APPLICATION_JSON
                    header("Authorization", "Bearer ${owner.token}")
                    content = """{"content": "Hi"}"""
                }.andExpect {
                    status { isNotFound() }
                }
        }

        @Test
        fun `400 when content is empty`() {
            val (owner, vet) = ownerAndVet()
            val convId = conversationId(owner.token, vet.id)

            mockMvc
                .post("/api/conversations/$convId/messages") {
                    contentType = MediaType.APPLICATION_JSON
                    header("Authorization", "Bearer ${owner.token}")
                    content = """{"content": ""}"""
                }.andExpect {
                    status { isBadRequest() }
                }
        }

        @Test
        fun `401 without auth`() {
            mockMvc
                .post("/api/conversations/1/messages") {
                    contentType = MediaType.APPLICATION_JSON
                    content = """{"content": "Hi"}"""
                }.andExpect {
                    status { isUnauthorized() }
                }
        }
    }

    @Nested
    inner class ListMessages {
        @Test
        fun `returns messages in chronological order`() {
            val (owner, vet) = ownerAndVet()
            val convId = conversationId(owner.token, vet.id)

            mockMvc.post("/api/conversations/$convId/messages") {
                contentType = MediaType.APPLICATION_JSON
                header("Authorization", "Bearer ${owner.token}")
                content = """{"content": "first"}"""
            }
            mockMvc.post("/api/conversations/$convId/messages") {
                contentType = MediaType.APPLICATION_JSON
                header("Authorization", "Bearer ${vet.token}")
                content = """{"content": "second"}"""
            }

            mockMvc
                .get("/api/conversations/$convId/messages") {
                    header("Authorization", "Bearer ${owner.token}")
                }.andExpect {
                    status { isOk() }
                    jsonPath("$.length()") { value(2) }
                    jsonPath("$[0].content") { value("first") }
                    jsonPath("$[1].content") { value("second") }
                }
        }

        @Test
        fun `404 when non-participant tries to list`() {
            val (owner, vet) = ownerAndVet()
            val convId = conversationId(owner.token, vet.id)
            val outsider = registerAccount("OWNER")

            mockMvc
                .get("/api/conversations/$convId/messages") {
                    header("Authorization", "Bearer ${outsider.token}")
                }.andExpect {
                    status { isNotFound() }
                }
        }

        @Test
        fun `404 when conversation does not exist`() {
            val owner = registerAccount("OWNER")
            mockMvc
                .get("/api/conversations/999999/messages") {
                    header("Authorization", "Bearer ${owner.token}")
                }.andExpect {
                    status { isNotFound() }
                }
        }

        @Test
        fun `401 without auth`() {
            mockMvc.get("/api/conversations/1/messages").andExpect { status { isUnauthorized() } }
        }
    }
}
