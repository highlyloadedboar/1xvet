package com.xvet.common

import com.xvet.api.model.ErrorResponse
import com.xvet.auth.EmailAlreadyExistsException
import com.xvet.auth.InvalidCredentialsException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {
    @ExceptionHandler(EmailAlreadyExistsException::class)
    fun handleEmailExists(ex: EmailAlreadyExistsException): ResponseEntity<ErrorResponse> {
        val message = ex.message ?: "Email already exists"
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ErrorResponse(message = message))
    }

    @ExceptionHandler(InvalidCredentialsException::class)
    fun handleInvalidCredentials(ex: InvalidCredentialsException): ResponseEntity<ErrorResponse> {
        val message = ex.message ?: "Invalid credentials"
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ErrorResponse(message = message))
    }
}
