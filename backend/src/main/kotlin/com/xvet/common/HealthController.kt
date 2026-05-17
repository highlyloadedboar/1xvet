package com.xvet.common

import com.xvet.api.HealthApi
import com.xvet.api.model.HealthResponse
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController

@RestController
class HealthController : HealthApi {
    override fun healthCheck(): ResponseEntity<HealthResponse> =
        ResponseEntity.ok(
            HealthResponse(
                status = "ok",
                version = "0.0.1",
            ),
        )
}
