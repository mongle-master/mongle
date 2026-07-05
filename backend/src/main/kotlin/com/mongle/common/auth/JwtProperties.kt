package com.mongle.common.auth

import org.springframework.boot.context.properties.ConfigurationProperties
import java.time.Duration

/**
 * JWT 설정(application.yml `mongle.jwt`).
 * - secret: HS256 서명 키. 256비트(32바이트) 이상이어야 한다(jjwt 가 짧으면 거부).
 * - expiration: 발급 후 만료까지의 기간(데모라 길게).
 */
@ConfigurationProperties(prefix = "mongle.jwt")
data class JwtProperties(
    val secret: String,
    val expiration: Duration,
)
