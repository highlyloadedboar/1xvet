package com.xvet.common

import com.xvet.api.model.ErrorResponse
import com.xvet.auth.EmailAlreadyExistsException
import com.xvet.auth.InvalidCredentialsException
import com.xvet.chat.ConversationNotFoundException
import com.xvet.chat.InvalidConversationPairException
import com.xvet.chat.UserNotFoundException
import com.xvet.pet.PetNotFoundException
import com.xvet.schedule.AppointmentNotFoundException
import com.xvet.schedule.InvalidSlotException
import com.xvet.schedule.OnlyOwnersCanBookException
import com.xvet.schedule.SlotBookedException
import com.xvet.schedule.SlotConflictException
import com.xvet.schedule.VetSlotNotFoundException
import com.xvet.vet.VetProfileNotFoundException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
@Suppress("TooManyFunctions")
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

    @ExceptionHandler(VetSlotNotFoundException::class)
    fun handleVetSlotNotFound(ex: VetSlotNotFoundException): ResponseEntity<ErrorResponse> {
        val message = ex.message ?: "Slot not found"
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ErrorResponse(message = message))
    }

    @ExceptionHandler(SlotConflictException::class)
    fun handleSlotConflict(ex: SlotConflictException): ResponseEntity<ErrorResponse> {
        val message = ex.message ?: "Slot conflict"
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ErrorResponse(message = message))
    }

    @ExceptionHandler(SlotBookedException::class)
    fun handleSlotBooked(ex: SlotBookedException): ResponseEntity<ErrorResponse> {
        val message = ex.message ?: "Slot is booked"
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ErrorResponse(message = message))
    }

    @ExceptionHandler(InvalidSlotException::class)
    fun handleInvalidSlot(ex: InvalidSlotException): ResponseEntity<ErrorResponse> {
        val message = ex.message ?: "Invalid slot"
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ErrorResponse(message = message))
    }

    @ExceptionHandler(AppointmentNotFoundException::class)
    fun handleAppointmentNotFound(ex: AppointmentNotFoundException): ResponseEntity<ErrorResponse> {
        val message = ex.message ?: "Appointment not found"
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ErrorResponse(message = message))
    }

    @ExceptionHandler(OnlyOwnersCanBookException::class)
    fun handleOnlyOwnersCanBook(ex: OnlyOwnersCanBookException): ResponseEntity<ErrorResponse> {
        val message = ex.message ?: "Only owners can book"
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ErrorResponse(message = message))
    }
}
