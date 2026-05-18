package com.xvet.pet

import java.time.LocalDate
import java.time.LocalDateTime

data class PetEntity(
    val id: Long = 0,
    val ownerId: Long,
    val name: String,
    val species: PetSpecies,
    val breed: String? = null,
    val birthDate: LocalDate? = null,
    val weight: Double? = null,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now(),
)

enum class PetSpecies {
    DOG,
    CAT,
    BIRD,
    RODENT,
    REPTILE,
    OTHER,
}
