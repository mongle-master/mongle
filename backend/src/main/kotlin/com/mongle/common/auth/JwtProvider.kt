package com.mongle.common.auth

import com.mongle.common.exception.BusinessException
import com.mongle.common.exception.ErrorCode
import io.jsonwebtoken.JwtException
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

    /**
     * 토큰에서 userId 를 꺼낸다. 서명 불일치·만료·형식 오류·sub 파싱 실패는 사유를 가리지 않고
     * 모두 401 UNAUTHORIZED 로 던진다 — 데모라 실패 원인을 사용자에게 구분해 알리지 않는다.
     */
    fun parseUserId(token: String): Long = try {
        Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .payload
            .subject
            .toLong()
    } catch (e: JwtException) {
        throw BusinessException(ErrorCode.UNAUTHORIZED)
    } catch (e: NumberFormatException) {
        throw BusinessException(ErrorCode.UNAUTHORIZED)
    }
}
