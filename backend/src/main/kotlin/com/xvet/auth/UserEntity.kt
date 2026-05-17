package com.xvet.auth

import java.time.LocalDateTime

data class UserEntity(
    val id: Long = 0,
    val email: String,
    val password: String,
    val firstName: String,
    val lastName: String,
    val role: UserRole,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now(),
)

enum class UserRole {
    OWNER,
    VET,
}
