package com.xvet.chat

import com.xvet.api.model.ConversationResponse
import com.xvet.api.model.MessageResponse
import com.xvet.auth.UserRepository
import com.xvet.auth.UserRole
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.time.ZoneOffset

@Service
class ChatService(
    private val conversationRepository: ConversationRepository,
    private val messageRepository: MessageRepository,
    private val userRepository: UserRepository,
) {
    @Transactional
    fun createOrGetConversation(
        callerId: Long,
        otherUserId: Long,
    ): ConversationResponse {
        val (ownerId, vetId) = resolveParticipants(callerId, otherUserId)
        val existing = conversationRepository.findByOwnerIdAndVetId(ownerId, vetId)
        val conversation = existing ?: conversationRepository.save(ConversationEntity(ownerId = ownerId, vetId = vetId))
        return conversation.toResponse()
    }

    private fun resolveParticipants(
        callerId: Long,
        otherUserId: Long,
    ): Pair<Long, Long> {
        if (callerId == otherUserId) throw InvalidConversationPairException("Cannot start a conversation with yourself")
        val caller = loadUser(callerId)
        val other = loadUser(otherUserId)
        return when {
            caller.role == UserRole.OWNER && other.role == UserRole.VET -> caller.id to other.id
            caller.role == UserRole.VET && other.role == UserRole.OWNER -> other.id to caller.id
            else -> throw InvalidConversationPairException("Conversation must be between one OWNER and one VET")
        }
    }

    private fun loadUser(id: Long) = userRepository.findByIdOrNull(id) ?: throw UserNotFoundException(id)

    fun listMyConversations(userId: Long): List<ConversationResponse> =
        conversationRepository
            .findByOwnerIdOrVetIdOrderByUpdatedAtDesc(userId, userId)
            .map { it.toResponse() }

    fun listMessages(
        conversationId: Long,
        userId: Long,
    ): List<MessageResponse> {
        requireParticipant(conversationId, userId)
        return messageRepository
            .findByConversationIdOrderByCreatedAtAsc(conversationId)
            .map { it.toResponse() }
    }

    @Transactional
    fun sendMessage(
        conversationId: Long,
        senderId: Long,
        content: String,
    ): MessageResponse {
        val conversation = requireParticipant(conversationId, senderId)
        val message =
            messageRepository.save(
                MessageEntity(
                    conversationId = conversationId,
                    senderId = senderId,
                    content = content,
                ),
            )
        conversation.updatedAt = LocalDateTime.now()
        conversationRepository.save(conversation)
        return message.toResponse()
    }

    private fun requireParticipant(
        conversationId: Long,
        userId: Long,
    ): ConversationEntity {
        val conversation =
            conversationRepository.findByIdOrNull(conversationId)
                ?: throw ConversationNotFoundException(conversationId)
        if (conversation.ownerId != userId && conversation.vetId != userId) {
            throw ConversationNotFoundException(conversationId)
        }
        return conversation
    }

    private fun ConversationEntity.toResponse(): ConversationResponse {
        val owner = userRepository.findByIdOrNull(ownerId)
        val vet = userRepository.findByIdOrNull(vetId)
        return ConversationResponse(
            id = id,
            ownerId = ownerId,
            ownerFirstName = owner?.firstName.orEmpty(),
            ownerLastName = owner?.lastName.orEmpty(),
            vetId = vetId,
            vetFirstName = vet?.firstName.orEmpty(),
            vetLastName = vet?.lastName.orEmpty(),
            createdAt = createdAt.atOffset(ZoneOffset.UTC),
            updatedAt = updatedAt.atOffset(ZoneOffset.UTC),
        )
    }

    private fun MessageEntity.toResponse(): MessageResponse =
        MessageResponse(
            id = id,
            conversationId = conversationId,
            senderId = senderId,
            content = content,
            createdAt = createdAt.atOffset(ZoneOffset.UTC),
        )
}

class ConversationNotFoundException(
    id: Long,
) : RuntimeException("Conversation not found: $id")

class InvalidConversationPairException(
    message: String,
) : RuntimeException(message)

class UserNotFoundException(
    id: Long,
) : RuntimeException("User not found: $id")
