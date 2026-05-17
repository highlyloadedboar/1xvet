package com.xvet

import io.zonky.test.db.AutoConfigureEmbeddedDatabase
import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureEmbeddedDatabase
class ApplicationTest {
    @Test
    fun contextLoads() {
        // Smoke test: application starts with all beans wired
    }
}
