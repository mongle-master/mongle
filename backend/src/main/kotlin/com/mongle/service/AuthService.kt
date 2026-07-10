package com.mongle.service

import com.mongle.common.Validators
import com.mongle.common.auth.JwtProvider
import com.mongle.controller.dto.TokenResponse
import com.mongle.domain.User
import com.mongle.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/** 데모 인증 표시 이름 최대 글자수. PRD 필드가 아니라 인증 편의용이라 여기서만 관리한다. */
private const val USERNAME_MAX = 20

/**
 * 데모 인증: 브라우저가 생성한 UUID로 사용자를 식별해 JWT를 발급한다(비밀번호 없음).
 * 처음 보는 UUID면 요청의 이름으로 사용자를 만든다. 이후 이름은 저장된 사용자 값을 사용한다.
 */
@Service
@Transactional(readOnly = true)
class AuthService(
    private val userRepository: UserRepository,
    private val jwtProvider: JwtProvider,
) {
    @Transactional
    fun issueToken(userId: UUID, rawUsername: String): TokenResponse {
        val username = rawUsername.trim()
        Validators.requireNotBlank(username, "이름을 입력해 주세요.")
        Validators.maxLength(username, USERNAME_MAX)

        val user = userRepository.findById(userId).orElseGet {
            userRepository.save(User(id = userId, username = username))
        }
        return TokenResponse(token = jwtProvider.issue(user.id, user.username), userId = user.id, username = user.username)
    }
}
