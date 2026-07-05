package com.mongle.common

/**
 * 입력 검증 한도(§12.3 글자수 · §12.2 개수 · §12.6 이미지 개수)의 SSOT.
 *
 * `const val` 이므로 DTO Bean Validation 에서도 그대로 참조한다:
 *   `@field:Size(max = ValidationLimits.EVENT_TITLE_MAX, message = "최대 {max}자까지 쓸 수 있어요.")`
 * ({max} 는 Bean Validation 이 max 속성값으로 치환한다.)
 * 서비스 계층의 개수·날짜·중복 검사는 Validators 를 쓴다.
 */
object ValidationLimits {
    // 글자수 (§12.3)
    const val NAME_MAX = 20
    const val RELATION_TYPE_MAX = 20
    const val CHIP_NAME_MAX = 10
    const val EVENT_TITLE_MAX = 40
    const val PREFERENCE_ITEM_MAX = 30
    const val WHY_MAX = 100
    const val WHAT_MAX = 100

    // 개수 (§12.2 / §12.6)
    const val CHIP_PER_KIND_MAX = 30
    const val EMOTION_PER_EVENT_MAX = 5
    const val RELATION_TAG_PER_PERSON_MAX = 10
    const val PREFERENCE_LIST_MAX = 20
    const val EVENT_PHOTO_MAX = 5
    const val PROFILE_PHOTO_MAX = 1
}
