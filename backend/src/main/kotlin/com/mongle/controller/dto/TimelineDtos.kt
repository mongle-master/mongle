package com.mongle.controller.dto

import java.time.LocalDate
import java.time.LocalTime

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

/** 전체 타임라인 카드에 붙는 연결 인물(#46) — 아바타(profileImageUrl)까지 실어 클라이언트가 바로 그린다(전역 전용). */
data class TimelinePerson(
    val id: Long,
    val name: String,
    val profileImageUrl: String?,
    val favorite: Boolean,
)

/**
 * 전체 타임라인 카드(#46) — 카드 표시·자동 제목은 [EventResponse] 를 그대로 재사용하고,
 * 전역 화면 전용인 '연결된 사람들'만 대표(즐겨찾기→가나다) 우선 정렬로 덧붙인다.
 */
data class TimelineCard(
    val id: Long,
    val title: String,
    val why: String?,
    val what: String?,
    val occurredDate: LocalDate,
    val occurredTime: LocalTime?,
    val category: ChipRef?,
    val weather: ChipRef?,
    val emotions: List<ChipRef>,
    val photoUrls: List<String>,
    val persons: List<TimelinePerson>,
) {
    companion object {
        fun from(base: EventResponse, persons: List<TimelinePerson>): TimelineCard = TimelineCard(
            id = base.id,
            title = base.title,
            why = base.why,
            what = base.what,
            occurredDate = base.occurredDate,
            occurredTime = base.occurredTime,
            category = base.category,
            weather = base.weather,
            emotions = base.emotions,
            photoUrls = base.photoUrls,
            persons = persons,
        )
    }
}

/** 월 단위 그룹(#46). 그룹도 카드도 최신→과거. label 은 `YYYY년 M월`. */
data class TimelineMonthGroup(
    val year: Int,
    val month: Int,
    val label: String,
    val cards: List<TimelineCard>,
)

data class TimelineResponse(
    val groups: List<TimelineMonthGroup>,
)
