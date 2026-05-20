package com.xvet.vet

import com.xvet.api.VetApi
import com.xvet.api.model.UpdateVetProfileRequest
import com.xvet.api.model.VetProfileResponse
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.RestController

@RestController
class VetController(
    private val vetProfileService: VetProfileService,
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

    private fun currentUserId(): Long {
        val auth = SecurityContextHolder.getContext().authentication
        return auth.principal as Long
    }
}
