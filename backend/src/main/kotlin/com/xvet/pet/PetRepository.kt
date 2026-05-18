package com.xvet.pet

import org.springframework.data.jpa.repository.JpaRepository

interface PetRepository : JpaRepository<PetEntity, Long> {
    fun findByOwnerIdOrderByCreatedAtDesc(ownerId: Long): List<PetEntity>
}
