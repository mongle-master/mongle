package com.mongle.common.auth

import com.mongle.common.context.UserPrincipal
import com.mongle.common.exception.BusinessException
import com.mongle.common.exception.ErrorCode
import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.stereotype.Component
import java.util.Date
import java.util.UUID

/** username 을 담는 커스텀 클레임 키. sub(=userId) 와 함께 principal 을 토큰만으로 복원한다. */
private const val USERNAME_CLAIM = "username"

/**
 * HS256 JWT 발급·검증. claim `sub` = userId 문자열, claim `username` = 로그인 이름.
 * 이 두 클레임만으로 UserPrincipal 을 복원한다 — 검증 시 DB 를 조회하지 않는다.
 */
@Component
class JwtProvider(
    properties: JwtProperties,
) {
    private val key = Keys.hmacShaKeyFor(properties.secret.toByteArray())
    private val expirationMillis = properties.expiration.toMillis()

    fun issue(
        userId: UUID,
        username: String,
    ): String {
        val now = Date()
        return Jwts.builder()
            .subject(userId.toString())
            .claim(USERNAME_CLAIM, username)
            .issuedAt(now)
            .expiration(Date(now.time + expirationMillis))
            .signWith(key, Jwts.SIG.HS256)
            .compact()
    }

    /**
     * 토큰에서 UserPrincipal(id·username) 을 복원한다. 서명 불일치·만료·형식 오류·sub 파싱 실패는
     * 사유를 가리지 않고 모두 401 UNAUTHORIZED — 데모라 실패 원인을 사용자에게 구분해 알리지 않는다.
     * username 클레임이 없는 옛 토큰(전환 이전 발급분)도 401 로 막는다 — 데모라 재로그인 한 번으로
     * 새 토큰을 받으면 해소되므로, principal 을 반쪽만 채우는 하위호환을 두지 않는다.
     */
    fun parsePrincipal(token: String): UserPrincipal = try {
        val claims = Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .payload
        val id = UUID.fromString(claims.subject)
        val username = claims.get(USERNAME_CLAIM, String::class.java)
            ?: throw BusinessException(ErrorCode.UNAUTHORIZED)
        UserPrincipal(id = id, username = username)
    } catch (e: JwtException) {
        throw BusinessException(ErrorCode.UNAUTHORIZED)
    } catch (e: IllegalArgumentException) {
        throw BusinessException(ErrorCode.UNAUTHORIZED)
    }
}
