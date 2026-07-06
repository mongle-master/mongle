package com.mongle.common.context

/**
 * 컨트롤러 메서드 파라미터에 현재 사용자 컨텍스트를 주입한다: `@AuthUser user: UserPrincipal`.
 * 해석은 AuthUserArgumentResolver — 토큰 클레임만으로 UserPrincipal 을 채운다.
 */
@Target(AnnotationTarget.VALUE_PARAMETER)
@Retention(AnnotationRetention.RUNTIME)
annotation class AuthUser
