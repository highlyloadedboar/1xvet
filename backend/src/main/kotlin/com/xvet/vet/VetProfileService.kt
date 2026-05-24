package com.xvet.vet

import com.xvet.api.model.UpdateVetProfileRequest
import com.xvet.api.model.VetProfileResponse
import com.xvet.auth.UserRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class VetProfileService(
    private val vetProfileRepository: VetProfileRepository,
    private val userRepository: UserRepository,
) {
    fun getMyProfile(userId: Long): VetProfileResponse {
        val profile =
            vetProfileRepository.findByUserId(userId)
                ?: throw VetProfileNotFoundException(userId)
        return profile.toResponse()
    }

    fun getProfileById(profileId: Long): VetProfileResponse {
        val profile =
            vetProfileRepository.findByIdOrNull(profileId)
                ?: throw VetProfileNotFoundException(profileId)
        return profile.toResponse()
    }

    fun updateProfile(
        userId: Long,
        request: UpdateVetProfileRequest,
    ): VetProfileResponse {
        var profile = vetProfileRepository.findByUserId(userId)
        if (profile == null) {
            profile =
                vetProfileRepository.save(
                    VetProfileEntity(
                        userId = userId,
                        specialty = request.specialty ?: "General",
                        experienceYears = request.experienceYears ?: 0,
                        description = request.description,
                        education = request.education,
                        priceRub = request.priceRub,
                        available = request.available ?: true,
                    ),
                )
        } else {
            request.specialty?.let { profile.specialty = it }
            request.experienceYears?.let { profile.experienceYears = it }
            request.description?.let { profile.description = it }
            request.education?.let { profile.education = it }
            request.priceRub?.let { profile.priceRub = it }
            request.available?.let { profile.available = it }
            profile.updatedAt = java.time.LocalDateTime.now()
            profile = vetProfileRepository.save(profile)
        }
        return profile.toResponse()
    }

    fun searchVets(
        specialty: String?,
        available: Boolean?,
    ): List<VetProfileResponse> {
        val profiles =
            when {
                specialty != null && available == true ->
                    vetProfileRepository.findBySpecialtyContainingIgnoreCaseAndAvailableTrue(specialty)
                specialty != null ->
                    vetProfileRepository.findBySpecialtyContainingIgnoreCase(specialty)
                available == true ->
                    vetProfileRepository.findByAvailableTrue()
                else ->
                    vetProfileRepository.findAll()
            }
        return profiles.map { it.toResponse() }
    }

    private fun VetProfileEntity.toResponse(): VetProfileResponse {
        val user = userRepository.findByIdOrNull(userId)
        return VetProfileResponse(
            id = id,
            userId = userId,
            firstName = user?.firstName ?: "",
            lastName = user?.lastName ?: "",
            specialty = specialty,
            experienceYears = experienceYears,
            description = description,
            education = education,
            priceRub = priceRub,
            available = available,
        )
    }
}

class VetProfileNotFoundException(
    id: Long,
) : RuntimeException("Vet profile not found: $id")
