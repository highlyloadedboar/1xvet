package com.xvet.schedule

import org.springframework.data.jpa.repository.JpaRepository

interface AppointmentRepository : JpaRepository<AppointmentEntity, Long> {
    fun findByOwnerIdOrderByCreatedAtDesc(ownerId: Long): List<AppointmentEntity>

    fun findBySlotIdInOrderByCreatedAtDesc(slotIds: Collection<Long>): List<AppointmentEntity>
}
