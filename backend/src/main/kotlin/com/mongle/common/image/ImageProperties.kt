package com.mongle.common.image

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.util.unit.DataSize

/**
 * 이미지 저장 설정(application.yml `mongle.image`).
 * - baseDir: 로컬 파일시스템 저장 루트
 * - urlPath: 정적 서빙 경로(WebConfig 리소스 핸들러와 URL 생성이 공유)
 * - maxBytes: 파일당 상한(§12.6 = 10MB)
 * - allowedExtensions: 허용 확장자(§12.6 = jpg·jpeg·png·heic·webp)
 */
@ConfigurationProperties(prefix = "mongle.image")
data class ImageProperties(
    val baseDir: String,
    val urlPath: String,
    val maxBytes: DataSize,
    val allowedExtensions: List<String>,
)
