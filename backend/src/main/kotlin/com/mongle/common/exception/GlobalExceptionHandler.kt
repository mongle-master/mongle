package com.mongle.common.exception

import io.github.oshai.kotlinlogging.KotlinLogging
import io.swagger.v3.oas.annotations.media.Schema
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.multipart.MaxUploadSizeExceededException
import org.springframework.web.servlet.resource.NoResourceFoundException

private val log = KotlinLogging.logger {}

@Schema(description = "공통 에러 응답. code 는 ErrorCode 이름, message 는 사용자에게 그대로 노출 가능한 문구(§12.5).")
data class ErrorResponse(
    @field:Schema(description = "에러 코드(ErrorCode enum 이름).", example = "REQUIRED_FIELD")
    val code: String,
    @field:Schema(description = "사용자 노출용 에러 문구.", example = "이름을 입력해 주세요.")
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

    // 정적 리소스 폴백까지 매칭 실패한 미존재 경로. 500(INTERNAL_ERROR)로 새지 않게 404로 응답한다.
    @ExceptionHandler(NoResourceFoundException::class)
    fun handleNoResource(e: NoResourceFoundException): ResponseEntity<ErrorResponse> = ErrorCode.NOT_FOUND.toResponse()

    @ExceptionHandler(Exception::class)
    fun handleUnexpected(e: Exception): ResponseEntity<ErrorResponse> {
        log.error(e) { "Unexpected error" }
        return ErrorCode.INTERNAL_ERROR.toResponse()
    }

    private fun ErrorCode.toResponse(message: String = this.message): ResponseEntity<ErrorResponse> = ResponseEntity.status(status).body(ErrorResponse(name, message))
}
