package com.mongle.common.auth

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.stereotype.Component
import java.util.Date

/**
 * HS256 JWT 발급·검증. claim `sub` = userId 문자열이 유일한 진실이다(리졸버가 이 값만 신뢰).
 */
@Component
class JwtProvider(
    properties: JwtProperties,
) {
    private val key = Keys.hmacShaKeyFor(properties.secret.toByteArray())
    private val expirationMillis = properties.expiration.toMillis()

    fun issue(userId: Long): String {
        val now = Date()
        return Jwts.builder()
            .subject(userId.toString())
            .issuedAt(now)
            .expiration(Date(now.time + expirationMillis))
            .signWith(key, Jwts.SIG.HS256)
            .compact()
    }
}
