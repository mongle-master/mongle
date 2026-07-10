plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.kotlin.jpa)
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
    alias(libs.plugins.ktlint)
}

group = "com.mongle"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(libs.versions.java.get().toInt())
    }
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict")
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_21)
    }
}

dependencies {
    // Kotlin
    implementation(libs.kotlin.reflect)
    implementation(libs.jackson.module.kotlin)
    implementation(libs.kotlin.logging.jvm)

    // Spring
    implementation(libs.spring.boot.starter.web)
    implementation(libs.spring.boot.starter.data.jpa)
    implementation(libs.spring.boot.starter.validation)
    implementation(libs.spring.boot.starter.actuator)

    // Auth (JWT) — api 는 컴파일, impl·jackson 은 런타임 구현체.
    implementation(libs.jjwt.api)
    runtimeOnly(libs.jjwt.impl)
    runtimeOnly(libs.jjwt.jackson)

    // API 문서 (OpenAPI 3 스펙 생성 + Swagger UI)
    implementation(libs.springdoc.openapi.starter.webmvc.ui)

    // Config metadata (application.yml auto-completion)
    annotationProcessor(libs.spring.boot.configuration.processor)

    // Database drivers
    runtimeOnly(libs.h2)
    runtimeOnly(libs.mysql.connector.j)
    runtimeOnly(libs.postgresql) // 배포(prod) — Supabase Postgres

    // Test
    testImplementation(libs.bundles.testing)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<Test> {
    useJUnitPlatform()
    systemProperty("user.timezone", "Asia/Seoul")
    systemProperty("spring.profiles.active", "test")
}

ktlint {
    filter {
        exclude { it.file.path.contains("/build/") }
    }
}
