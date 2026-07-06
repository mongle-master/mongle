package com.mongle.config

import com.mongle.common.context.AuthUserArgumentResolver
import com.mongle.common.image.ImageProperties
import org.springframework.context.annotation.Configuration
import org.springframework.web.method.support.HandlerMethodArgumentResolver
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
