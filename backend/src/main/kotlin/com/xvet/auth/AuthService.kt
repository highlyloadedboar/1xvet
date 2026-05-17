package com.xvet.auth

import com.xvet.api.model.AuthResponse
import com.xvet.api.model.AuthResponseUser
import com.xvet.api.model.LoginRequest
import com.xvet.api.model.RegisterRequest
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService,
) {
    fun register(request: RegisterRequest): AuthResponse {
        if (userRepository.existsByEmail(request.email)) {
            throw EmailAlreadyExistsException(request.email)
        }

        val user =
            userRepository.save(
                UserEntity(
                    email = request.email,
                    password = passwordEncoder.encode(request.password),
                    firstName = request.firstName,
                    lastName = request.lastName,
                    role = UserRole.valueOf(request.role.value),
                ),
            )

        return AuthResponse(
            token = jwtService.generateToken(user),
            user = user.toUserInfo(),
        )
    }

    fun login(request: LoginRequest): AuthResponse {
        val user =
            userRepository.findByEmail(request.email)
                ?: throw InvalidCredentialsException()

        if (!passwordEncoder.matches(request.password, user.password)) {
            throw InvalidCredentialsException()
        }

        return AuthResponse(
            token = jwtService.generateToken(user),
            user = user.toUserInfo(),
        )
    }
}

class EmailAlreadyExistsException(
    email: String,
) : RuntimeException("Email already exists: $email")

class InvalidCredentialsException : RuntimeException("Invalid email or password")

fun UserEntity.toUserInfo() =
    AuthResponseUser(
        id = id,
        email = email,
        firstName = firstName,
        lastName = lastName,
        role = AuthResponseUser.Role.valueOf(role.name),
    )
