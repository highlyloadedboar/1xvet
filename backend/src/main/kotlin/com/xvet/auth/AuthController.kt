package com.xvet.auth

import com.xvet.api.AuthApi
import com.xvet.api.model.AuthResponse
import com.xvet.api.model.LoginRequest
import com.xvet.api.model.RegisterRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController

@RestController
class AuthController(
    private val authService: AuthService,
) : AuthApi {
    override fun register(registerRequest: RegisterRequest): ResponseEntity<AuthResponse> {
        val response = authService.register(registerRequest)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    override fun login(loginRequest: LoginRequest): ResponseEntity<AuthResponse> {
        TODO("Will be implemented in next PR")
    }
}
