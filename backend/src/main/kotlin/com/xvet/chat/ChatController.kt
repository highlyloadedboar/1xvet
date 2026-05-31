package com.xvet.chat

import com.xvet.api.ChatApi
import com.xvet.api.model.ConversationResponse
import com.xvet.api.model.CreateConversationRequest
import com.xvet.api.model.MessageResponse
import com.xvet.api.model.SendMessageRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.RestController

@RestController
class ChatController(
    private val chatService: ChatService,
) : ChatApi {
    override fun listConversations(): ResponseEntity<List<ConversationResponse>> =
        ResponseEntity.ok(chatService.listMyConversations(currentUserId()))

    @Suppress("MaxLineLength")
    override fun createConversation(createConversationRequest: CreateConversationRequest): ResponseEntity<ConversationResponse> {
        val conversation =
            chatService.createOrGetConversation(currentUserId(), createConversationRequest.otherUserId)
        return ResponseEntity.ok(conversation)
    }

    override fun listMessages(conversationId: Long): ResponseEntity<List<MessageResponse>> =
        ResponseEntity.ok(chatService.listMessages(conversationId, currentUserId()))

    override fun sendMessage(
        conversationId: Long,
        sendMessageRequest: SendMessageRequest,
    ): ResponseEntity<MessageResponse> {
        val message = chatService.sendMessage(conversationId, currentUserId(), sendMessageRequest.content)
        return ResponseEntity.status(HttpStatus.CREATED).body(message)
    }

    private fun currentUserId(): Long {
        val auth = SecurityContextHolder.getContext().authentication
        return auth.principal as Long
    }
}
