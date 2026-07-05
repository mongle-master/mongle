package com.mongle.controller

import com.mongle.common.exception.ErrorResponse
import com.mongle.controller.dto.TokenRequest
import com.mongle.controller.dto.TokenResponse
import com.mongle.service.AuthService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.security.SecurityRequirements
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Tag(name = "인증", description = "데모 로그인 — 이름만으로 JWT 를 발급한다.")
@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val authService: AuthService,
) {
    // 토큰 발급은 인증 이전 단계라 전역 bearer 요구사항에서 제외한다(SecurityRequirements 빈).
    @SecurityRequirements
    @Operation(
        summary = "토큰 발급",
        description = "이름(username)만으로 로그인해 JWT 를 발급한다. 처음 보는 이름이면 사용자를 새로 만든다(데모라 비밀번호·회원가입 없음).",
    )
    @ApiResponses(
        ApiResponse(
            responseCode = "400",
            description = "이름 누락(REQUIRED_FIELD) 또는 글자수 초과(LENGTH_EXCEEDED).",
            content = [Content(schema = Schema(implementation = ErrorResponse::class))],
        ),
    )
    @PostMapping("/token")
    fun issueToken(
        @RequestBody request: TokenRequest,
    ): TokenResponse = authService.issueToken(request.username)
}
