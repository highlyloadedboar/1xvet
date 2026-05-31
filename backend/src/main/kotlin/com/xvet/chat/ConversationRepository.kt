package com.xvet.chat

import org.springframework.data.jpa.repository.JpaRepository

interface ConversationRepository : JpaRepository<ConversationEntity, Long> {
    fun findByOwnerIdAndVetId(
        ownerId: Long,
        vetId: Long,
    ): ConversationEntity?

    fun findByOwnerIdOrVetIdOrderByUpdatedAtDesc(
        ownerId: Long,
        vetId: Long,
    ): List<ConversationEntity>
}
