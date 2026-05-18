package com.xvet.pet

import com.xvet.api.model.CreatePetRequest
import com.xvet.api.model.PetResponse
import com.xvet.api.model.UpdatePetRequest
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class PetService(
    private val petRepository: PetRepository,
) {
    fun getMyPets(ownerId: Long): List<PetResponse> {
        val pets = petRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId)
        return pets.map { it.toResponse() }
    }

    fun getPet(
        petId: Long,
        ownerId: Long,
    ): PetResponse {
        val pet = petRepository.findByIdOrNull(petId) ?: throw PetNotFoundException(petId)
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
        val pet = petRepository.findByIdOrNull(petId) ?: throw PetNotFoundException(petId)
        if (pet.ownerId != ownerId) throw PetNotFoundException(petId)

        request.name?.let { pet.name = it }
        request.species?.let { pet.species = PetSpecies.valueOf(it.value) }
        request.breed?.let { pet.breed = it }
        request.birthDate?.let { pet.birthDate = it }
        request.weight?.let { pet.weight = it }
        pet.updatedAt = java.time.LocalDateTime.now()

        return petRepository.save(pet).toResponse()
    }

    fun deletePet(
        petId: Long,
        ownerId: Long,
    ) {
        val pet = petRepository.findByIdOrNull(petId) ?: throw PetNotFoundException(petId)
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
