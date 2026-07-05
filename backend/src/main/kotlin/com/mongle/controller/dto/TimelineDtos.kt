package com.mongle.controller.dto

import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDate
import java.time.LocalTime

/**
 * 활동 흐름 집계(#45). 레인(만남/연락/추억) × 월의 유무 매트릭스.
 * `months` 는 과거→현재 순, 각 레인 `present` 는 `months` 와 같은 인덱스로 정렬된다.
 * 값은 유무(boolean)만 — 횟수·강도는 담지 않는다(관계 점수화 금지).
 */
@Schema(description = "활동 흐름 응답 — 레인(만남/연락/추억) × 월의 유무 매트릭스. 횟수·강도는 담지 않는다(관계 점수화 금지).")
data class ActivityFlowResponse(
    @field:Schema(description = "월 라벨 목록(과거→현재 순). 각 레인 present 와 인덱스가 대응한다.", example = "[\"2026-02\", \"2026-03\", \"2026-04\"]")
    val months: List<String>,
    @field:Schema(description = "레인별 월간 유무 목록.")
    val lanes: List<ActivityFlowLane>,
    // 전 기간(윈도 밖 포함) 3레인 기록 존재 여부 — 차트 감춤 vs "조용했어요" 판정용.
    @field:Schema(description = "윈도 밖 포함 전 기간에 세 레인 기록이 하나라도 있는지 여부. 차트 감춤과 '조용했어요' 판정에 쓴다.", example = "true")
    val hasAnyActivity: Boolean,
)

@Schema(description = "활동 흐름 한 레인. present 는 months 와 같은 인덱스로 월별 기록 유무를 담는다.")
data class ActivityFlowLane(
    @field:Schema(description = "레인 종류(만남/연락/추억).", example = "MEETING")
    val lane: ActivityLane,
    @field:Schema(description = "레인에 대응하는 카테고리 라벨.", example = "만남")
    val categoryLabel: String,
    @field:Schema(description = "months 와 같은 인덱스의 월별 기록 유무.", example = "[false, true, true]")
    val present: List<Boolean>,
)

@Schema(description = "활동 흐름 레인 종류. MEETING=만남, CONTACT=연락, MEMORY=추억.")
enum class ActivityLane {
    MEETING,
    CONTACT,
    MEMORY,
}

/** 전체 타임라인 카드에 붙는 연결 인물(#46) — 아바타(profileImageUrl)까지 실어 클라이언트가 바로 그린다(전역 전용). */
@Schema(description = "전체 타임라인 카드에 붙는 연결 인물. 아바타까지 실어 바로 그린다(전역 화면 전용).")
data class TimelinePerson(
    @field:Schema(description = "인물 id.", example = "7")
    val id: Long,
    @field:Schema(description = "인물 이름.", example = "김하늘")
    val name: String,
    @field:Schema(description = "프로필 이미지 URL(없을 수 있음).", example = "/images/p7.jpg")
    val profileImageUrl: String?,
    @field:Schema(description = "즐겨찾기 여부.", example = "true")
    val favorite: Boolean,
)

/**
 * 전체 타임라인 카드(#46) — 카드 표시·자동 제목은 [EventResponse] 를 그대로 재사용하고,
 * 전역 화면 전용인 '연결된 사람들'만 대표(즐겨찾기→가나다) 우선 정렬로 덧붙인다.
 */
@Schema(description = "전체 타임라인 카드. 기록 표시는 기록 응답과 같고, '연결된 사람들'을 즐겨찾기→가나다 순으로 덧붙인다.")
data class TimelineCard(
    @field:Schema(description = "기록 id.", example = "21")
    val id: Long,
    @field:Schema(description = "표시용 최종 제목(자동 제목 포함).", example = "김하늘 · 만남")
    val title: String,
    @field:Schema(description = "왜(계기·맥락).", example = "오랜만에 얼굴 보려고")
    val why: String?,
    @field:Schema(description = "무엇을(있었던 일).", example = "저녁 먹고 한강에서 두 시간 걸었다")
    val what: String?,
    @field:Schema(description = "일어난 날짜.", example = "2026-07-05")
    val occurredDate: LocalDate,
    @field:Schema(description = "일어난 시각(없을 수 있음).", example = "19:30:00")
    val occurredTime: LocalTime?,
    @field:Schema(description = "카테고리 칩 요약 참조.")
    val category: ChipRef?,
    @field:Schema(description = "날씨 칩 요약 참조(없을 수 있음).")
    val weather: ChipRef?,
    @field:Schema(description = "감정 칩 요약 참조 목록.")
    val emotions: List<ChipRef>,
    @field:Schema(description = "첨부 사진 URL 목록.", example = "[\"/images/a1b2.jpg\"]")
    val photoUrls: List<String>,
    @field:Schema(description = "연결된 사람들(대표 우선 정렬).")
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
@Schema(description = "월 단위 카드 그룹. 그룹도 카드도 최신→과거 순.")
data class TimelineMonthGroup(
    @field:Schema(description = "연도.", example = "2026")
    val year: Int,
    @field:Schema(description = "월(1~12).", example = "7")
    val month: Int,
    @field:Schema(description = "월 라벨.", example = "2026년 7월")
    val label: String,
    @field:Schema(description = "이 달의 카드 목록(최신→과거).")
    val cards: List<TimelineCard>,
)

@Schema(description = "나의 통합 연대기(전체 타임라인) 응답. 월 단위 그룹으로 묶는다.")
data class TimelineResponse(
    @field:Schema(description = "월 단위 그룹 목록(최신→과거).")
    val groups: List<TimelineMonthGroup>,
)
