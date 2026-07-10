package com.mongle.controller.dto

import io.swagger.v3.oas.annotations.media.Schema
import java.util.UUID

/**
 * 데모 인증 요청. 브라우저가 생성한 UUID와 표시 이름을 받는다.
 * 이름의 빈값·글자수 검증은 서비스 계층(AuthService)에서 §12.5 문구로 처리한다.
 */
@Schema(description = "데모 인증 요청 — 브라우저 UUID와 이름으로 토큰을 발급받는다.")
data class TokenRequest(
    @field:Schema(description = "브라우저가 최초 접속 때 생성해 보관하는 사용자 UUID.", example = "8e0ca8f5-a713-4a90-9df1-15f0be0d843c")
    val userId: UUID,
    @field:Schema(description = "표시 이름. 처음 보는 UUID의 사용자를 만들 때 저장한다.", example = "정순원")
    val username: String,
)

@Schema(description = "발급된 JWT 와 사용자 정보. token 을 Authorize 에 넣어 이후 API 를 호출한다.")
data class TokenResponse(
    @field:Schema(description = "인증에 사용할 JWT. `Authorization: Bearer {token}` 형태로 보낸다.", example = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abc")
    val token: String,
    @field:Schema(description = "발급 대상 사용자 id.", example = "1")
    val userId: UUID,
    @field:Schema(description = "로그인 이름.", example = "정순원")
    val username: String,
)
