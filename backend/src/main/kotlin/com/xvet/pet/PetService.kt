package com.xvet.pet

import com.xvet.api.model.CreatePetRequest
import com.xvet.api.model.PetResponse
import com.xvet.api.model.UpdatePetRequest
import org.springframework.stereotype.Service

@Service
class PetService(
    private val petRepository: PetRepository,
) {
    fun getMyPets(ownerId: Long): List<PetResponse> = petRepository.findByOwnerId(ownerId).map { it.toResponse() }

    fun getPet(
        petId: Long,
        ownerId: Long,
    ): PetResponse {
        val pet = petRepository.findById(petId) ?: throw PetNotFoundException(petId)
        if (pet.ownerId != ownerId) throw PetNotFoundException(petId)
        return pet.toResponse()
    }

    fun createPet(
        request: CreatePetRequest,
        ownerId: Long,
    ): PetResponse {
        val pet =
            petRepository.save(
                PetEntity(
                    ownerId = ownerId,
                    name = request.name,
                    species = PetSpecies.valueOf(request.species.value),
                    breed = request.breed,
                    birthDate = request.birthDate,
                    weight = request.weight,
                ),
            )
        return pet.toResponse()
    }

    fun updatePet(
        petId: Long,
        request: UpdatePetRequest,
        ownerId: Long,
    ): PetResponse {
        val existing = petRepository.findById(petId) ?: throw PetNotFoundException(petId)
        if (existing.ownerId != ownerId) throw PetNotFoundException(petId)

        val updated =
            existing.copy(
                name = request.name ?: existing.name,
                species = request.species?.let { PetSpecies.valueOf(it.value) } ?: existing.species,
                breed = request.breed ?: existing.breed,
                birthDate = request.birthDate ?: existing.birthDate,
                weight = request.weight ?: existing.weight,
            )
        return petRepository.update(updated).toResponse()
    }

    fun deletePet(
        petId: Long,
        ownerId: Long,
    ) {
        val pet = petRepository.findById(petId) ?: throw PetNotFoundException(petId)
        if (pet.ownerId != ownerId) throw PetNotFoundException(petId)
        petRepository.deleteById(petId)
    }
}

class PetNotFoundException(
    petId: Long,
) : RuntimeException("Pet not found: $petId")

fun PetEntity.toResponse() =
    PetResponse(
        id = id,
        name = name,
        species = PetResponse.Species.valueOf(species.name),
        breed = breed,
        birthDate = birthDate,
        weight = weight,
        ownerId = ownerId,
    )
