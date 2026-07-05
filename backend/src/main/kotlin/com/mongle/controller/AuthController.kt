package com.mongle.controller

import com.mongle.controller.dto.TokenRequest
import com.mongle.controller.dto.TokenResponse
import com.mongle.service.AuthService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val authService: AuthService,
) {
    @PostMapping("/token")
    fun issueToken(
        @RequestBody request: TokenRequest,
    ): TokenResponse = authService.issueToken(request.username)
}
