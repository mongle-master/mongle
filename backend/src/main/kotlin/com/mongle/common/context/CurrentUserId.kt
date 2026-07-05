package com.mongle.common.context

/**
 * 컨트롤러 메서드 파라미터에 현재 사용자 id 를 주입한다: `@CurrentUserId userId: Long`.
 * 평범한 Long 과 구분하기 위한 마커. 해석은 CurrentUserIdArgumentResolver.
 */
@Target(AnnotationTarget.VALUE_PARAMETER)
@Retention(AnnotationRetention.RUNTIME)
annotation class CurrentUserId
