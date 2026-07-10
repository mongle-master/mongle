package com.mongle.config

import com.mongle.common.context.AuthUserArgumentResolver
import com.mongle.common.image.ImageProperties
import org.springframework.context.annotation.Configuration
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import java.nio.file.Paths

@Configuration
class WebConfig(
    private val authUserArgumentResolver: AuthUserArgumentResolver,
    private val imageProperties: ImageProperties,
) : WebMvcConfigurer {
    override fun addArgumentResolvers(resolvers: MutableList<HandlerMethodArgumentResolver>) {
        resolvers.add(authUserArgumentResolver)
    }

    // 전 오리진 허용 — 인증이 쿠키가 아니라 Authorization 헤더의 Bearer 토큰이라
    // 크리덴셜(allowCredentials) 없이 와일드카드가 안전하다. 덕분에 프론트 배포
    // 도메인이 바뀌거나 늘어나도(로컬 dev·Vercel 프리뷰 등) 코드 변경이 없다.
    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/**")
            .allowedOrigins("*")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .maxAge(3600)
    }

    // 업로드 이미지를 baseDir 에서 urlPath(=/images) 로 정적 서빙(#12).
    // 정적 리소스라 API 버전 프리픽스(/api/v1) 밖에 둔다 — 버저닝 대상은 API 계약이지 파일 URL 이 아니다.
    // (업로드 엔드포인트 ImageController 자체는 /api/v1/images 로 버전 안에 있다.)
    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        val base = Paths.get(imageProperties.baseDir).toAbsolutePath().normalize().toUri().toString()
        val location = if (base.endsWith("/")) base else "$base/"
        registry.addResourceHandler("${imageProperties.urlPath}/**")
            .addResourceLocations(location)
    }
}
