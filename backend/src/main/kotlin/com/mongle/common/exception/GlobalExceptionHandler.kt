package com.mongle.common.exception

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.multipart.MaxUploadSizeExceededException

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
        return e.errorCode.toResponse(e.message)
    }

    // @Valid 실패. DTO 제약(@Size 등)의 message 는 이미 §12.5 사용자 문구이므로 필드명 없이 그대로 노출한다.
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(e: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val message = e.bindingResult.fieldErrors
            .mapNotNull { it.defaultMessage }
            .distinct()
            .joinToString(" ")
            .ifBlank { ErrorCode.INVALID_INPUT.message }
        return ErrorCode.INVALID_INPUT.toResponse(message)
    }

    @ExceptionHandler(MaxUploadSizeExceededException::class)
    fun handleUploadSize(e: MaxUploadSizeExceededException): ResponseEntity<ErrorResponse> = ErrorCode.IMAGE_TOO_LARGE.toResponse()

    @ExceptionHandler(Exception::class)
    fun handleUnexpected(e: Exception): ResponseEntity<ErrorResponse> {
        log.error(e) { "Unexpected error" }
        return ErrorCode.INTERNAL_ERROR.toResponse()
    }

    private fun ErrorCode.toResponse(message: String = this.message): ResponseEntity<ErrorResponse> = ResponseEntity.status(status).body(ErrorResponse(name, message))
}
