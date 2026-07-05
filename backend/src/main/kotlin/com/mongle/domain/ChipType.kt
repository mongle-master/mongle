package com.mongle.domain

/**
 * 칩 종류. 각 종류는 독립 세트(중복·개수·기본값 규칙은 종류 안에서만 따진다).
 *
 * 기록(event)은 EMOTION·WEATHER·CATEGORY 를, 인물(person)은 RELATION_TAG 를 칩 id 로 참조한다.
 * RELATION_TAG 만 공통 시드가 없다(모두 개인).
 */
enum class ChipType {
    EMOTION,
    WEATHER,
    CATEGORY,
    RELATION_TAG,
}
