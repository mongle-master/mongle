package com.mongle.common.image

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Profile

/**
 * Supabase Storage 저장 설정(application-prod.yml `mongle.supabase`). prod 프로필에서만 바인딩된다.
 * (기본/로컬 프로필에는 `mongle.supabase.*` 가 없어 바인딩 실패하므로 @Profile 로 스캔에서 제외.)
 * - url: 프로젝트 URL(예: https://xxxx.supabase.co) — 끝 슬래시 없이
 * - bucket: 이미지 버킷명(공개 버킷). 공개 URL 서빙에 사용
 * - serviceKey: service_role 키. 업로드·삭제 권한. 절대 클라이언트로 내려가면 안 됨(서버 전용 env)
 */
@Profile("prod")
@ConfigurationProperties(prefix = "mongle.supabase")
data class SupabaseProperties(
    val url: String,
    val bucket: String,
    val serviceKey: String,
)
