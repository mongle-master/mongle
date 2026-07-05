package com.mongle.controller.dto

/**
 * 데모 로그인 요청. 비밀번호 없이 username 만 받는다.
 * 빈값·글자수 검증은 서비스 계층(AuthService)에서 §12.5 문구로 처리한다.
 */
data class TokenRequest(
    val username: String,
)

data class TokenResponse(
    val token: String,
    val userId: Long,
    val username: String,
)
