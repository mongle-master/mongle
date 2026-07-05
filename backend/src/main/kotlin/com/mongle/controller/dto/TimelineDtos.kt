package com.mongle.controller.dto

/**
 * 활동 흐름 집계(#45). 레인(만남/연락/추억) × 월의 유무 매트릭스.
 * `months` 는 과거→현재 순, 각 레인 `present` 는 `months` 와 같은 인덱스로 정렬된다.
 * 값은 유무(boolean)만 — 횟수·강도는 담지 않는다(관계 점수화 금지).
 */
data class ActivityFlowResponse(
    val months: List<String>,
    val lanes: List<ActivityFlowLane>,
    // 전 기간(윈도 밖 포함) 3레인 기록 존재 여부 — 차트 감춤 vs "조용했어요" 판정용.
    val hasAnyActivity: Boolean,
)

data class ActivityFlowLane(
    val lane: ActivityLane,
    val categoryLabel: String,
    val present: List<Boolean>,
)

enum class ActivityLane {
    MEETING,
    CONTACT,
    MEMORY,
}
