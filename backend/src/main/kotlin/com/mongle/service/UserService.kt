package com.mongle.service

import com.mongle.common.exception.BusinessException
import com.mongle.common.exception.ErrorCode
import com.mongle.controller.dto.UserProfileRequest
import com.mongle.controller.dto.UserProfileResponse
import com.mongle.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional(readOnly = true)
class UserService(
    private val userRepository: UserRepository,
) {
    @Transactional
    fun completeProfileSetup(userId: UUID, request: UserProfileRequest): UserProfileResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { BusinessException(ErrorCode.NOT_FOUND) }
        user.completeProfileSetup(request.profileImageUrl, request.gender)
        return UserProfileResponse.from(user)
    }
}
