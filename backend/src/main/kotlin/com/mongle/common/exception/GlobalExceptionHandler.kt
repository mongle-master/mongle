package com.mongle.common.exception

import com.fasterxml.jackson.databind.exc.InvalidNullException
import com.mongle.common.Messages
import io.github.oshai.kotlinlogging.KotlinLogging
import io.swagger.v3.oas.annotations.media.Schema
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.MissingServletRequestParameterException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
import org.springframework.web.multipart.MaxUploadSizeExceededException
import org.springframework.web.multipart.support.MissingServletRequestPartException
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

    /**
     * 본문 파싱 실패(JSON 문법 오류·필수 필드 누락·필드 타입 불일치). 클라이언트 오류라 500 으로 새지 않게 400 으로 돌린다.
     * 필수 필드 누락은 jackson-module-kotlin 이 MissingKotlinParameterException 으로 던지는데, 그 클래스는
     * deprecated(2.19)라 상위 타입 InvalidNullException 으로 잡는다(클래스명 문자열 매칭 회피).
     * 필드명은 wrapWithPath 가 채운 path 의 마지막 조각에서 얻어 §12.5 필수 문구로 매핑한다.
     */
    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleNotReadable(e: HttpMessageNotReadableException): ResponseEntity<ErrorResponse> {
        log.warn { "Unreadable request body: ${e.message}" }
        val requiredMessage = generateSequence(e.cause) { it.cause }
            .filterIsInstance<InvalidNullException>()
            .firstOrNull()
            ?.let { REQUIRED_FIELD_MESSAGES[it.path.lastOrNull()?.fieldName] }
            ?: return ErrorCode.INVALID_INPUT.toResponse()
        return ErrorCode.REQUIRED_FIELD.toResponse(requiredMessage)
    }

    // 쿼리 파라미터·경로 변수 타입 불일치(없는 enum 값, 숫자 자리에 문자 등). 클라이언트 오류 → 400.
    @ExceptionHandler(MethodArgumentTypeMismatchException::class)
    fun handleTypeMismatch(e: MethodArgumentTypeMismatchException): ResponseEntity<ErrorResponse> {
        log.warn { "Argument type mismatch: ${e.name}=${e.value}" }
        return ErrorCode.INVALID_INPUT.toResponse()
    }

    // 필수 쿼리 파라미터·multipart 파트 누락. 클라이언트 오류 → 400.
    @ExceptionHandler(MissingServletRequestParameterException::class, MissingServletRequestPartException::class)
    fun handleMissingParameter(e: Exception): ResponseEntity<ErrorResponse> {
        log.warn { "Missing request parameter: ${e.message}" }
        return ErrorCode.INVALID_INPUT.toResponse()
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

    companion object {
        // 본문 필수 필드 누락 시 (JSON 필드명 → §12.5 필수 문구) 매핑의 단일 표. 새 필수 필드는 여기에 행만 추가한다.
        private val REQUIRED_FIELD_MESSAGES = mapOf(
            "name" to Messages.REQUIRED_NAME,
            "label" to Messages.REQUIRED_CHIP_NAME,
            "username" to Messages.REQUIRED_NAME,
        )
    }
}
