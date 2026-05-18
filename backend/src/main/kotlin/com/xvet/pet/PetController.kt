package com.xvet.pet

import com.xvet.api.PetApi
import com.xvet.api.model.CreatePetRequest
import com.xvet.api.model.PetResponse
import com.xvet.api.model.UpdatePetRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.RestController

@RestController
class PetController(
    private val petService: PetService,
) : PetApi {
    override fun getMyPets(): ResponseEntity<List<PetResponse>> {
        val ownerId = currentUserId()
        return ResponseEntity.ok(petService.getMyPets(ownerId))
    }

    override fun getPet(petId: Long): ResponseEntity<PetResponse> {
        val ownerId = currentUserId()
        return ResponseEntity.ok(petService.getPet(petId, ownerId))
    }

    override fun createPet(createPetRequest: CreatePetRequest): ResponseEntity<PetResponse> {
        val ownerId = currentUserId()
        val pet = petService.createPet(createPetRequest, ownerId)
        return ResponseEntity.status(HttpStatus.CREATED).body(pet)
    }

    override fun updatePet(
        petId: Long,
        updatePetRequest: UpdatePetRequest,
    ): ResponseEntity<PetResponse> {
        val ownerId = currentUserId()
        return ResponseEntity.ok(petService.updatePet(petId, updatePetRequest, ownerId))
    }

    override fun deletePet(petId: Long): ResponseEntity<Unit> {
        val ownerId = currentUserId()
        petService.deletePet(petId, ownerId)
        return ResponseEntity.noContent().build()
    }

    private fun currentUserId(): Long {
        val auth: Authentication =
            org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .authentication
        return auth.principal as Long
    }
}
