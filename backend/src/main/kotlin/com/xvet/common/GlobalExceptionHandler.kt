package com.xvet.common

import com.xvet.api.model.ErrorResponse
import com.xvet.auth.EmailAlreadyExistsException
import com.xvet.auth.InvalidCredentialsException
import com.xvet.chat.ConversationNotFoundException
import com.xvet.chat.InvalidConversationPairException
import com.xvet.chat.UserNotFoundException
import com.xvet.pet.PetNotFoundException
import com.xvet.vet.VetProfileNotFoundException
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

    @ExceptionHandler(PetNotFoundException::class)
    fun handlePetNotFound(ex: PetNotFoundException): ResponseEntity<ErrorResponse> {
        val message = ex.message ?: "Pet not found"
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ErrorResponse(message = message))
    }

    @ExceptionHandler(VetProfileNotFoundException::class)
    fun handleVetProfileNotFound(ex: VetProfileNotFoundException): ResponseEntity<ErrorResponse> {
        val message = ex.message ?: "Vet profile not found"
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ErrorResponse(message = message))
    }

    @ExceptionHandler(ConversationNotFoundException::class)
    fun handleConversationNotFound(ex: ConversationNotFoundException): ResponseEntity<ErrorResponse> {
        val message = ex.message ?: "Conversation not found"
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ErrorResponse(message = message))
    }

    @ExceptionHandler(UserNotFoundException::class)
    fun handleUserNotFound(ex: UserNotFoundException): ResponseEntity<ErrorResponse> {
        val message = ex.message ?: "User not found"
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ErrorResponse(message = message))
    }

    @ExceptionHandler(InvalidConversationPairException::class)
    fun handleInvalidConversationPair(ex: InvalidConversationPairException): ResponseEntity<ErrorResponse> {
        val message = ex.message ?: "Invalid conversation participants"
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ErrorResponse(message = message))
    }
}
