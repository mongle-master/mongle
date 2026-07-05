package com.mongle.common.exception

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

private val log = KotlinLogging.logger {}

data class ErrorResponse(
    val code: String,
    val message: String,
)

@RestControllerAdvice
class GlobalExceptionHandler {
    @ExceptionHandler(BusinessException::class)
    fun handleBusiness(e: BusinessException): ResponseEntity<ErrorResponse> {
        log.warn { "BusinessException: ${e.errorCode} - ${e.message}" }
        return ResponseEntity
            .status(e.errorCode.status)
            .body(ErrorResponse(e.errorCode.name, e.message))
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(e: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val message = e.bindingResult.fieldErrors.joinToString(", ") {
            "${it.field}: ${it.defaultMessage}"
        }
        return ResponseEntity
            .status(ErrorCode.INVALID_INPUT.status)
            .body(ErrorResponse(ErrorCode.INVALID_INPUT.name, message))
    }

    @ExceptionHandler(Exception::class)
    fun handleUnexpected(e: Exception): ResponseEntity<ErrorResponse> {
        log.error(e) { "Unexpected error" }
        return ResponseEntity
            .status(ErrorCode.INTERNAL_ERROR.status)
            .body(ErrorResponse(ErrorCode.INTERNAL_ERROR.name, ErrorCode.INTERNAL_ERROR.message))
    }
}
