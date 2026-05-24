package com.xvet.vet

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "vet_profiles")
class VetProfileEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(name = "user_id", nullable = false, unique = true)
    val userId: Long,
    @Column(nullable = false)
    var specialty: String,
    @Column(name = "experience_years", nullable = false)
    var experienceYears: Int = 0,
    var description: String? = null,
    var education: String? = null,
    @Column(name = "price_rub")
    var priceRub: Int? = null,
    @Column(nullable = false)
    var available: Boolean = true,
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now(),
)
