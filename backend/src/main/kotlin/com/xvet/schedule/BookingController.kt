package com.xvet.schedule

import com.xvet.api.BookingApi
import com.xvet.api.model.AppointmentResponse
import com.xvet.api.model.CreateAppointmentRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.RestController

@RestController
class BookingController(
    private val bookingService: BookingService,
) : BookingApi {
    override fun listMyAppointments(): ResponseEntity<List<AppointmentResponse>> =
        ResponseEntity.ok(bookingService.listMyAppointments(currentUserId()))

    @Suppress("MaxLineLength")
    override fun createAppointment(createAppointmentRequest: CreateAppointmentRequest): ResponseEntity<AppointmentResponse> {
        val appointment =
            bookingService.createAppointment(
                callerId = currentUserId(),
                slotId = createAppointmentRequest.slotId,
                petId = createAppointmentRequest.petId,
                reason = createAppointmentRequest.reason,
            )
        return ResponseEntity.status(HttpStatus.CREATED).body(appointment)
    }

    override fun cancelAppointment(appointmentId: Long): ResponseEntity<AppointmentResponse> =
        ResponseEntity.ok(bookingService.cancelAppointment(currentUserId(), appointmentId))

    private fun currentUserId(): Long {
        val auth = SecurityContextHolder.getContext().authentication
        return auth.principal as Long
    }
}
