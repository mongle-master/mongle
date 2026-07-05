package com.mongle.config

import com.mongle.common.context.CurrentUserIdArgumentResolver
import com.mongle.common.image.ImageProperties
import org.springframework.context.annotation.Configuration
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import java.nio.file.Paths

@Configuration
class WebConfig(
    private val currentUserIdArgumentResolver: CurrentUserIdArgumentResolver,
    private val imageProperties: ImageProperties,
) : WebMvcConfigurer {
    override fun addArgumentResolvers(resolvers: MutableList<HandlerMethodArgumentResolver>) {
        resolvers.add(currentUserIdArgumentResolver)
    }

    // 업로드 이미지를 baseDir 에서 urlPath 로 정적 서빙(#12).
    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        val base = Paths.get(imageProperties.baseDir).toAbsolutePath().normalize().toUri().toString()
        val location = if (base.endsWith("/")) base else "$base/"
        registry.addResourceHandler("${imageProperties.urlPath}/**")
            .addResourceLocations(location)
    }
}
