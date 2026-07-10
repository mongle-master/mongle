package com.mongle.controller.dto

import com.mongle.domain.User
import com.mongle.domain.UserGender
import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "최초 온보딩에서 저장할 사용자 프로필.")
data class UserProfileRequest(
    @field:Schema(description = "기본 아바타 경로 또는 업로드 이미지 URL.", nullable = true)
    val profileImageUrl: String? = null,
    @field:Schema(description = "기본 아바타 분류에 사용한 성별.", nullable = true)
    val gender: UserGender? = null,
)

@Schema(description = "사용자 프로필 저장 결과.")
data class UserProfileResponse(
    val username: String,
    val profileImageUrl: String?,
    val gender: UserGender?,
    val profileSetupCompleted: Boolean,
) {
    companion object {
        fun from(user: User) = UserProfileResponse(
            username = user.username,
            profileImageUrl = user.profileImageUrl,
            gender = user.gender,
            profileSetupCompleted = user.isProfileSetupCompleted,
        )
    }
}
