package com.xvet.schedule

import com.xvet.api.model.AppointmentResponse
import com.xvet.auth.UserRepository
import com.xvet.auth.UserRole
import com.xvet.pet.PetNotFoundException
import com.xvet.pet.PetRepository
import com.xvet.vet.VetProfileRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.time.ZoneOffset

@Service
class BookingService(
    private val appointmentRepository: AppointmentRepository,
    private val vetSlotRepository: VetSlotRepository,
    private val vetProfileRepository: VetProfileRepository,
    private val petRepository: PetRepository,
    private val userRepository: UserRepository,
) {
    @Transactional
    fun createAppointment(
        callerId: Long,
        slotId: Long,
        petId: Long?,
        reason: String?,
    ): AppointmentResponse {
        requireOwner(callerId)
        val slot = loadAvailableSlot(slotId)
        if (petId != null) requirePetOwnedBy(petId, callerId)

        val saved =
            appointmentRepository.save(
                AppointmentEntity(slotId = slotId, ownerId = callerId, petId = petId, reason = reason),
            )
        slot.booked = true
        vetSlotRepository.save(slot)
        return buildResponse(saved, slot)
    }

    private fun requireOwner(callerId: Long) {
        val caller =
            userRepository.findByIdOrNull(callerId)
                ?: throw OnlyOwnersCanBookException("Caller not found")
        if (caller.role != UserRole.OWNER) {
            throw OnlyOwnersCanBookException("Only owners can book consultations")
        }
    }

    private fun loadAvailableSlot(slotId: Long): VetSlotEntity {
        val slot = vetSlotRepository.findByIdOrNull(slotId) ?: throw VetSlotNotFoundException(slotId)
        if (slot.booked) throw SlotConflictException("Slot is already booked")
        return slot
    }

    private fun requirePetOwnedBy(
        petId: Long,
        ownerId: Long,
    ) {
        val pet = petRepository.findByIdOrNull(petId) ?: throw PetNotFoundException(petId)
        if (pet.ownerId != ownerId) throw PetNotFoundException(petId)
    }

    fun listMyAppointments(callerId: Long): List<AppointmentResponse> {
        val asOwner = appointmentRepository.findByOwnerIdOrderByCreatedAtDesc(callerId)
        val mySlotIds = vetSlotRepository.findByVetIdOrderByStartTimeAsc(callerId).map { it.id }
        val asVet =
            if (mySlotIds.isEmpty()) {
                emptyList()
            } else {
                appointmentRepository.findBySlotIdInOrderByCreatedAtDesc(mySlotIds)
            }
        return (asOwner + asVet)
            .distinctBy { it.id }
            .sortedByDescending { it.createdAt }
            .map { buildResponse(it) }
    }

    @Transactional
    fun cancelAppointment(
        callerId: Long,
        appointmentId: Long,
    ): AppointmentResponse {
        val appointment =
            appointmentRepository.findByIdOrNull(appointmentId)
                ?: throw AppointmentNotFoundException(appointmentId)
        val slot =
            vetSlotRepository.findByIdOrNull(appointment.slotId)
                ?: throw AppointmentNotFoundException(appointmentId)

        val isOwner = appointment.ownerId == callerId
        val isVet = slot.vetId == callerId
        if (!isOwner && !isVet) throw AppointmentNotFoundException(appointmentId)

        if (appointment.status == AppointmentStatus.BOOKED) {
            appointment.status = AppointmentStatus.CANCELLED
            appointment.updatedAt = LocalDateTime.now()
            appointmentRepository.save(appointment)
            slot.booked = false
            vetSlotRepository.save(slot)
        }
        return buildResponse(appointment, slot)
    }

    private fun buildResponse(
        appointment: AppointmentEntity,
        slot: VetSlotEntity? = null,
    ): AppointmentResponse {
        val resolvedSlot = slot ?: vetSlotRepository.findByIdOrNull(appointment.slotId)
        val vetUserId = resolvedSlot?.vetId ?: 0L
        val vetProfile = vetProfileRepository.findByUserId(vetUserId)
        val vetUser = userRepository.findByIdOrNull(vetUserId)
        val owner = userRepository.findByIdOrNull(appointment.ownerId)
        val pet = appointment.petId?.let { petRepository.findByIdOrNull(it) }
        return AppointmentResponse(
            id = appointment.id,
            slotId = appointment.slotId,
            slotStartTime =
                resolvedSlot?.startTime
                    ?: appointment.createdAt.atOffset(ZoneOffset.UTC),
            ownerId = appointment.ownerId,
            ownerFirstName = owner?.firstName.orEmpty(),
            ownerLastName = owner?.lastName.orEmpty(),
            vetProfileId = vetProfile?.id ?: 0L,
            vetFirstName = vetUser?.firstName.orEmpty(),
            vetLastName = vetUser?.lastName.orEmpty(),
            petId = appointment.petId,
            petName = pet?.name,
            reason = appointment.reason,
            status = AppointmentResponse.Status.valueOf(appointment.status.name),
            createdAt = appointment.createdAt.atOffset(ZoneOffset.UTC),
        )
    }
}

class AppointmentNotFoundException(
    id: Long,
) : RuntimeException("Appointment not found: $id")

class OnlyOwnersCanBookException(
    message: String,
) : RuntimeException(message)
