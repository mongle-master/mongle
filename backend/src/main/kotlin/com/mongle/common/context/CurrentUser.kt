package com.mongle.common.context

import org.springframework.stereotype.Component

/**
 * 소유 컨텍스트(공통/개인)의 기준이 되는 현재 사용자.
 *
 * 로컬 단일 사용자 데모라 인증은 범위 밖 — 고정 데모 사용자 1명으로 동작한다.
 * 소유가 있는 엔티티는 `ownerId: Long?` 를 갖고, null=공통(모두 공유)·값=개인으로 구분한다.
 * 정식 인증으로 전환하면 provider 구현만 교체하면 된다.
 */
const val DEMO_USER_ID: Long = 1L

@Component
class CurrentUserProvider {
    fun userId(): Long = DEMO_USER_ID
}
