package com.mongle.common.image

import com.mongle.common.exception.ErrorResponse
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.security.SecurityRequirements
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

/**
 * 공통 단건 이미지 업로드. 반환한 url 을 도메인(프로필·기록)이 저장·연결한다.
 */
@Tag(name = "이미지", description = "공통 단건 이미지 업로드 — 반환한 url 을 프로필·기록이 저장·연결한다.")
@RestController
@RequestMapping("/api/v1/images")
class ImageController(
    private val imageStorageService: ImageStorageService,
) {
    // 업로드는 토큰 없이 열려 있다(도메인 저장 단계에서 소유권을 확인). 전역 bearer 요구사항에서 제외.
    @SecurityRequirements
    @Operation(
        summary = "이미지 업로드",
        description = "단건 이미지를 저장하고 정적 서빙 url 을 돌려준다. jpg·png·heic·webp, 각 10MB 이하만 허용한다. 용도별 개수(프로필 1·기록 5)는 각 도메인이 강제한다.",
    )
    @ApiResponses(
        ApiResponse(
            responseCode = "400",
            description = "빈 파일(INVALID_INPUT), 미지원 확장자(UNSUPPORTED_IMAGE_TYPE), 크기 초과(IMAGE_TOO_LARGE).",
            content = [Content(schema = Schema(implementation = ErrorResponse::class))],
        ),
    )
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun upload(
        @RequestParam("file") file: MultipartFile,
    ): StoredImage = imageStorageService.store(file)
}
