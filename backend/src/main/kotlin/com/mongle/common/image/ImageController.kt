package com.mongle.common.image

import com.mongle.common.context.AuthUser
import com.mongle.common.context.UserPrincipal
import com.mongle.common.exception.ErrorResponse
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * Vercel Blob 클라이언트 업로드 전 사용자 인증을 확인한다.
 * 파일은 백엔드를 거치지 않고 브라우저에서 Blob 으로 직접 전송된다.
 */
@Tag(name = "이미지", description = "Vercel Blob 직접 업로드 권한을 확인한다.")
@RestController
@RequestMapping("/api/v1/images")
class ImageController {
    @Operation(
        summary = "이미지 업로드 권한 확인",
        description = "Vercel 함수가 Blob 업로드 토큰을 발급하기 전에 JWT 유효성을 확인한다.",
    )
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "업로드 권한 확인 완료.",
        ),
        ApiResponse(
            responseCode = "401",
            description = "토큰 없음·무효(UNAUTHORIZED).",
            content = [Content(schema = Schema(implementation = ErrorResponse::class))],
        ),
    )
    @PostMapping("/upload-permission")
    fun authorizeUpload(@AuthUser user: UserPrincipal) = Unit
}
