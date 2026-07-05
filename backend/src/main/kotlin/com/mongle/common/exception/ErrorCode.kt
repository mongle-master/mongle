package com.mongle.common.exception

import org.springframework.http.HttpStatus

/**
 * 애플리케이션 에러 코드. 새 에러 유형은 여기에 추가한다.
 */
enum class ErrorCode(
    val status: HttpStatus,
    val message: String,
) {
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "잘못된 입력입니다."),
    NOT_FOUND(HttpStatus.NOT_FOUND, "리소스를 찾을 수 없습니다."),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다."),
}
