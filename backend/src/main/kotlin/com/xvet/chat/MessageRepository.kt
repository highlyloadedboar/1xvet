package com.xvet.chat

import org.springframework.data.jpa.repository.JpaRepository

interface MessageRepository : JpaRepository<MessageEntity, Long> {
    fun findByConversationIdOrderByCreatedAtAsc(conversationId: Long): List<MessageEntity>
}
