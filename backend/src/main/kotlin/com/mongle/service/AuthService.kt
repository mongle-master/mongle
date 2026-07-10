package com.mongle.service

import com.mongle.common.Validators
import com.mongle.common.auth.JwtProvider
import com.mongle.controller.dto.TokenResponse
import com.mongle.domain.User
import com.mongle.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/** 브라우저 익명 식별자로 사용하는 UUID 문자열 길이. */
private const val USERNAME_MAX = 36

/**
 * 데모 로그인: 브라우저 UUID를 username으로 저장해 JWT를 발급한다(비밀번호 없음).
 * 처음 보는 UUID면 사용자를 만들어 준다 — 데모라 회원가입 절차를 따로 두지 않는다.
 */
@Service
@Transactional(readOnly = true)
class AuthService(
    private val userRepository: UserRepository,
    private val jwtProvider: JwtProvider,
) {
    @Transactional
    fun issueToken(rawUsername: String): TokenResponse {
        val username = rawUsername.trim()
        Validators.requireNotBlank(username, "이름을 입력해 주세요.")
        Validators.maxLength(username, USERNAME_MAX)

        val user = userRepository.findByUsername(username)
            ?: userRepository.save(User(username = username))
        val userId = requireNotNull(user.id) { "저장되지 않은 User 로는 토큰을 발급할 수 없습니다." }
        return TokenResponse(token = jwtProvider.issue(userId, user.username), userId = userId, username = user.username)
    }
}
