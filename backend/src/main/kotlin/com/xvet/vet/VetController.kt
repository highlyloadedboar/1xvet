package com.xvet.vet

import com.xvet.api.VetApi
import com.xvet.api.model.CreateSlotRequest
import com.xvet.api.model.SlotResponse
import com.xvet.api.model.UpdateVetProfileRequest
import com.xvet.api.model.VetProfileResponse
import com.xvet.schedule.VetSlotService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.RestController
import java.time.OffsetDateTime

@RestController
class VetController(
    private val vetProfileService: VetProfileService,
    private val vetSlotService: VetSlotService,
) : VetApi {
    override fun getMyVetProfile(): ResponseEntity<VetProfileResponse> {
        val profile = vetProfileService.getMyProfile(currentUserId())
        return ResponseEntity.ok(profile)
    }

    @Suppress("MaxLineLength")
    override fun updateVetProfile(updateVetProfileRequest: UpdateVetProfileRequest): ResponseEntity<VetProfileResponse> {
        val profile = vetProfileService.updateProfile(currentUserId(), updateVetProfileRequest)
        return ResponseEntity.ok(profile)
    }

    override fun searchVets(
        specialty: String?,
        available: Boolean?,
    ): ResponseEntity<List<VetProfileResponse>> {
        val vets = vetProfileService.searchVets(specialty, available)
        return ResponseEntity.ok(vets)
    }

    override fun getVetProfile(vetId: Long): ResponseEntity<VetProfileResponse> {
        val profile = vetProfileService.getProfileById(vetId)
        return ResponseEntity.ok(profile)
    }

    override fun getMyVetSlots(): ResponseEntity<List<SlotResponse>> {
        val slots = vetSlotService.listMySlots(currentUserId())
        return ResponseEntity.ok(slots)
    }

    override fun createVetSlot(createSlotRequest: CreateSlotRequest): ResponseEntity<SlotResponse> {
        val slot = vetSlotService.createSlot(currentUserId(), createSlotRequest.startTime)
        return ResponseEntity.status(HttpStatus.CREATED).body(slot)
    }

    override fun deleteVetSlot(slotId: Long): ResponseEntity<Unit> {
        vetSlotService.deleteSlot(currentUserId(), slotId)
        return ResponseEntity.noContent().build()
    }

    override fun listVetSlots(
        vetId: Long,
        from: OffsetDateTime?,
        to: OffsetDateTime?,
    ): ResponseEntity<List<SlotResponse>> {
        val slots = vetSlotService.listAvailableSlots(vetId, from, to)
        return ResponseEntity.ok(slots)
    }

    private fun currentUserId(): Long {
        val auth = SecurityContextHolder.getContext().authentication
        return auth.principal as Long
    }
}
