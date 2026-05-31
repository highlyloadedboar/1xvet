package com.xvet.schedule

import com.xvet.api.model.SlotResponse
import com.xvet.vet.VetProfileNotFoundException
import com.xvet.vet.VetProfileRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.time.OffsetDateTime
import java.time.ZoneOffset

@Service
class VetSlotService(
    private val vetSlotRepository: VetSlotRepository,
    private val vetProfileRepository: VetProfileRepository,
) {
    fun listMySlots(vetUserId: Long): List<SlotResponse> {
        val profileId = vetProfileRepository.findByUserId(vetUserId)?.id ?: 0L
        return vetSlotRepository
            .findByVetIdOrderByStartTimeAsc(vetUserId)
            .map { it.toResponse(profileId) }
    }

    fun createSlot(
        vetUserId: Long,
        startTime: OffsetDateTime,
    ): SlotResponse {
        val profile =
            vetProfileRepository.findByUserId(vetUserId)
                ?: throw VetProfileNotFoundException(vetUserId)
        if (startTime.isBefore(OffsetDateTime.now())) {
            throw InvalidSlotException("Slot start time must be in the future")
        }
        if (vetSlotRepository.findByVetIdAndStartTime(vetUserId, startTime) != null) {
            throw SlotConflictException("Slot at this time already exists")
        }
        val saved = vetSlotRepository.save(VetSlotEntity(vetId = vetUserId, startTime = startTime))
        return saved.toResponse(profile.id)
    }

    fun deleteSlot(
        vetUserId: Long,
        slotId: Long,
    ) {
        val slot = vetSlotRepository.findByIdOrNull(slotId) ?: throw VetSlotNotFoundException(slotId)
        if (slot.vetId != vetUserId) throw VetSlotNotFoundException(slotId)
        if (slot.booked) throw SlotBookedException("Cannot delete a booked slot")
        vetSlotRepository.deleteById(slotId)
    }

    fun listAvailableSlots(
        vetProfileId: Long,
        from: OffsetDateTime?,
        to: OffsetDateTime?,
    ): List<SlotResponse> {
        val vetProfile =
            vetProfileRepository.findByIdOrNull(vetProfileId)
                ?: throw VetProfileNotFoundException(vetProfileId)
        val now = OffsetDateTime.now(ZoneOffset.UTC)
        val fromTs = from ?: now
        val toTs = to ?: fromTs.plusDays(DEFAULT_RANGE_DAYS)
        return vetSlotRepository
            .findByVetIdAndBookedFalseAndStartTimeBetweenOrderByStartTimeAsc(
                vetProfile.userId,
                fromTs,
                toTs,
            ).map { it.toResponse(vetProfile.id) }
    }

    private fun VetSlotEntity.toResponse(vetProfileId: Long): SlotResponse =
        SlotResponse(
            id = id,
            vetId = vetProfileId,
            startTime = startTime,
            booked = booked,
        )

    companion object {
        private const val DEFAULT_RANGE_DAYS = 30L
    }
}

class VetSlotNotFoundException(
    id: Long,
) : RuntimeException("Slot not found: $id")

class SlotConflictException(
    message: String,
) : RuntimeException(message)

class SlotBookedException(
    message: String,
) : RuntimeException(message)

class InvalidSlotException(
    message: String,
) : RuntimeException(message)
