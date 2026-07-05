package com.mongle.controller.dto

import io.swagger.v3.oas.annotations.media.Schema

/**
 * 데모 로그인 요청. 비밀번호 없이 username 만 받는다.
 * 빈값·글자수 검증은 서비스 계층(AuthService)에서 §12.5 문구로 처리한다.
 */
@Schema(description = "데모 로그인 요청 — 비밀번호 없이 이름만으로 토큰을 발급받는다.")
data class TokenRequest(
    @field:Schema(description = "로그인 이름. 처음 보는 이름이면 사용자를 새로 만들어 발급한다.", example = "정순원")
    val username: String,
)

@Schema(description = "발급된 JWT 와 사용자 정보. token 을 Authorize 에 넣어 이후 API 를 호출한다.")
data class TokenResponse(
    @field:Schema(description = "인증에 사용할 JWT. `Authorization: Bearer {token}` 형태로 보낸다.", example = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abc")
    val token: String,
    @field:Schema(description = "발급 대상 사용자 id.", example = "1")
    val userId: Long,
    @field:Schema(description = "로그인 이름.", example = "정순원")
    val username: String,
)
