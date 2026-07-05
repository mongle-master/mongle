package com.mongle.common.context

import com.mongle.common.auth.JwtProvider
import com.mongle.common.exception.BusinessException
import com.mongle.common.exception.ErrorCode
import org.springframework.core.MethodParameter
import org.springframework.http.HttpHeaders
import org.springframework.stereotype.Component
import org.springframework.web.bind.support.WebDataBinderFactory
import org.springframework.web.context.request.NativeWebRequest
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.method.support.ModelAndViewContainer

private const val BEARER_PREFIX = "Bearer "

/**
 * `@CurrentUserId Long` 파라미터를 Authorization 헤더의 Bearer JWT 에서 해석한다.
 * 이 파라미터를 쓰는 엔드포인트만 토큰을 요구한다 — 무인증 경로(auth·actuator·정적 이미지·스웨거)는
 * @CurrentUserId 를 받지 않으므로 자연히 열린다(별도 보안 필터 없이 데모에 맞게 가볍게).
 * 헤더 없음·Bearer 형식 아님·서명/만료 무효는 모두 401 UNAUTHORIZED.
 */
@Component
class CurrentUserIdArgumentResolver(
    private val jwtProvider: JwtProvider,
) : HandlerMethodArgumentResolver {
    override fun supportsParameter(parameter: MethodParameter): Boolean = parameter.hasParameterAnnotation(CurrentUserId::class.java) &&
        (parameter.parameterType == Long::class.java || parameter.parameterType == Long::class.javaObjectType)

    override fun resolveArgument(
        parameter: MethodParameter,
        mavContainer: ModelAndViewContainer?,
        webRequest: NativeWebRequest,
        binderFactory: WebDataBinderFactory?,
    ): Any {
        val token = webRequest.getHeader(HttpHeaders.AUTHORIZATION)
            ?.takeIf { it.startsWith(BEARER_PREFIX) }
            ?.substring(BEARER_PREFIX.length)
            ?.trim()
            ?: throw BusinessException(ErrorCode.UNAUTHORIZED)
        return jwtProvider.parseUserId(token)
    }
}
