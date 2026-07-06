package com.mongle.config

import com.mongle.common.context.AuthUser
import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springdoc.core.utils.SpringDocUtils
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

/**
 * OpenAPI(Swagger) 전역 구성.
 *
 * 인증은 JWT Bearer 하나뿐이라 securityScheme 을 전역 요구사항으로 건다 —
 * 토큰이 없어도 되는 발급 API(`POST /api/v1/auth/token`)와 이미지 업로드는
 * 각 메서드에서 `@SecurityRequirements`(빈) 로 자물쇠를 끈다.
 * 실제 인증 경계는 컨트롤러의 `@AuthUser` 유무이므로(AuthUserArgumentResolver),
 * 문서의 자물쇠 표시도 그 경계와 일치시킨다.
 */
@Configuration
class OpenApiConfig {
    init {
        // @AuthUser 는 토큰에서 주입되는 서버 내부 값이라 스웨거 파라미터로 노출하지 않는다.
        SpringDocUtils.getConfig().addAnnotationsToIgnore(AuthUser::class.java)
    }

    @Bean
    fun mongleOpenApi(): OpenAPI = OpenAPI()
        .info(
            Info()
                .title("관계도감 API")
                .description(
                    "관계도감 — 사람 중심 관계 기록 서비스의 백엔드 API.\n\n" +
                        "사람(인물)·기록·칩(카테고리·감정·날씨·관계태그)을 중심으로 관계 지도, 활동 흐름, " +
                        "나의 통합 연대기(전체 타임라인), 1년 전 오늘 회고를 제공한다.\n\n" +
                        "**인증**: `POST /api/v1/auth/token` 으로 발급받은 JWT 를 우측 상단 Authorize 에 넣으면 " +
                        "이후 모든 API 에 `Authorization: Bearer {token}` 이 붙는다.",
                )
                .version("v1"),
        )
        .addSecurityItem(SecurityRequirement().addList(BEARER_SCHEME))
        .components(
            Components()
                .addSecuritySchemes(
                    BEARER_SCHEME,
                    SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("`POST /api/v1/auth/token` 응답의 token 값. `Bearer` 접두어 없이 토큰만 입력한다."),
                ),
        )

    companion object {
        /** 전역 securityScheme·개별 @SecurityRequirement 에서 참조하는 스킴 이름. */
        const val BEARER_SCHEME = "bearerAuth"
    }
}
