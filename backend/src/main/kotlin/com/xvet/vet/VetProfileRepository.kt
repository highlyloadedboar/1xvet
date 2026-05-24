package com.xvet.vet

import org.springframework.data.jpa.repository.JpaRepository

interface VetProfileRepository : JpaRepository<VetProfileEntity, Long> {
    fun findByUserId(userId: Long): VetProfileEntity?

    fun findByAvailableTrue(): List<VetProfileEntity>

    fun findBySpecialtyContainingIgnoreCase(specialty: String): List<VetProfileEntity>

    fun findBySpecialtyContainingIgnoreCaseAndAvailableTrue(specialty: String): List<VetProfileEntity>
}
