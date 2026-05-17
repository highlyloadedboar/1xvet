package com.xvet.common

import com.xvet.api.model.ErrorResponse
import com.xvet.auth.EmailAlreadyExistsException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {
    @ExceptionHandler(EmailAlreadyExistsException::class)
    fun handleEmailExists(ex: EmailAlreadyExistsException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.CONFLICT).body(ErrorResponse(message = ex.message ?: "Email already exists"))
}
