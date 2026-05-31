package com.xvet.schedule

import org.springframework.data.jpa.repository.JpaRepository
import java.time.OffsetDateTime

interface VetSlotRepository : JpaRepository<VetSlotEntity, Long> {
    fun findByVetIdOrderByStartTimeAsc(vetId: Long): List<VetSlotEntity>

    fun findByVetIdAndStartTime(
        vetId: Long,
        startTime: OffsetDateTime,
    ): VetSlotEntity?

    fun findByVetIdAndBookedFalseAndStartTimeBetweenOrderByStartTimeAsc(
        vetId: Long,
        from: OffsetDateTime,
        to: OffsetDateTime,
    ): List<VetSlotEntity>
}
