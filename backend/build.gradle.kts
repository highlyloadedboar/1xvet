plugins {
    id("org.springframework.boot") version "3.4.1"
    id("io.spring.dependency-management") version "1.1.7"
    kotlin("jvm") version "2.0.21"
    kotlin("plugin.spring") version "2.0.21"
    id("org.openapi.generator") version "7.10.0"
    id("io.gitlab.arturbosch.detekt") version "1.23.8"
    id("org.jlleitschuh.gradle.ktlint") version "12.1.2"
}

group = "com.xvet"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-websocket")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-jooq")

    // Kotlin
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")

    // Database
    runtimeOnly("org.postgresql:postgresql")
    implementation("org.liquibase:liquibase-core")

    // JWT
    implementation("io.jsonwebtoken:jjwt-api:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")

    // OpenAPI
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.7.0")
    implementation("jakarta.validation:jakarta.validation-api")
    implementation("jakarta.annotation:jakarta.annotation-api")

    // Logging
    implementation("io.github.microutils:kotlin-logging-jvm:3.0.5")

    // Test
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("io.zonky.test:embedded-database-spring-test:2.5.1")
    testImplementation("io.zonky.test:embedded-postgres:2.0.7")
    testImplementation("io.mockk:mockk:1.13.13")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict")
    }
}

// ─── OpenAPI Generator ─────────────────────────────────────────────────────────

openApiGenerate {
    generatorName.set("kotlin-spring")
    inputSpec.set("${rootProject.projectDir}/../api/specs/openapi.yaml")
    outputDir.set("${layout.buildDirectory.get()}/generated/openapi")
    apiPackage.set("com.xvet.api")
    modelPackage.set("com.xvet.api.model")
    configOptions.set(
        mapOf(
            "interfaceOnly" to "true",
            "useSpringBoot3" to "true",
            "useTags" to "true",
            "documentationProvider" to "springdoc",
            "reactive" to "false",
            "enumPropertyNaming" to "UPPERCASE",
        ),
    )
}

sourceSets {
    main {
        kotlin {
            srcDir("${layout.buildDirectory.get()}/generated/openapi/src/main/kotlin")
            srcDir("${layout.buildDirectory.get()}/generated/jooq")
        }
    }
}

tasks.named("compileKotlin") {
    dependsOn("openApiGenerate")
}

// ─── jOOQ ──────────────────────────────────────────────────────────────────────
// Run manually when DB is up: ./gradlew jooqCodegen

tasks.register<JavaExec>("jooqCodegen") {
    group = "jooq"
    description = "Generate jOOQ classes from database schema"
    mainClass.set("org.jooq.codegen.GenerationTool")
    classpath = sourceSets["main"].runtimeClasspath
    args = listOf("src/main/resources/jooq-config.xml")
}

// ─── detekt ────────────────────────────────────────────────────────────────────

detekt {
    buildUponDefaultConfig = true
    config.setFrom(files("$projectDir/config/detekt.yml"))
}

// ─── ktlint ────────────────────────────────────────────────────────────────────

ktlint {
    version.set("1.5.0")
    android.set(false)
    filter {
        exclude { it.file.path.contains("/generated/") || it.file.path.contains("/build/") }
    }
}

// ─── Tasks ─────────────────────────────────────────────────────────────────────

tasks.withType<Test> {
    useJUnitPlatform()
}

tasks.withType<io.gitlab.arturbosch.detekt.Detekt>().configureEach {
    exclude("**/generated/**")
}

tasks.named("runKtlintCheckOverMainSourceSet") {
    dependsOn("openApiGenerate")
}
tasks.matching { it.name == "runKtlintFormatOverMainSourceSet" }.configureEach {
    dependsOn("openApiGenerate")
}
