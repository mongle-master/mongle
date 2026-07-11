package com.mongle.controller

import com.mongle.common.context.AuthUser
import com.mongle.common.context.UserPrincipal
import com.mongle.controller.dto.UserProfileRequest
import com.mongle.controller.dto.UserProfileResponse
import com.mongle.service.UserService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@Tag(name = "사용자", description = "인증된 사용자를 관리한다.")
@RestController
@RequestMapping("/api/v1/users/me")
class UserController(
    private val userService: UserService,
) {
    @Operation(
        summary = "최초 프로필 설정 완료",
        description = "기본 아바타 또는 업로드 이미지를 저장한다. 값을 보내지 않으면 프로필 설정을 건너뛴다.",
    )
    @PatchMapping("/profile")
    fun completeProfileSetup(
        @AuthUser user: UserPrincipal,
        @RequestBody request: UserProfileRequest,
    ): UserProfileResponse = userService.completeProfileSetup(user.id, request)

    @Operation(
        summary = "현재 사용자 삭제",
        description = "테스트를 위해 현재 사용자를 삭제한다.",
    )
    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteCurrentUser(
        @AuthUser user: UserPrincipal,
    ) = userService.deleteCurrentUser(user.id)
}
