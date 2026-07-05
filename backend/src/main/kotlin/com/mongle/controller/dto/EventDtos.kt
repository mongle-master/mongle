package com.mongle.controller.dto

import com.mongle.domain.Event
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

/**
 * 등록·수정 공용 요청. 필수는 연결 인물(≥1)뿐 — 카테고리·날짜는 미지정 시 기본값(만남·오늘)으로 채운다.
 * 빈값·글자수·개수·소속(내 인물·보이는 칩)·날짜 검증은 서비스(EventValidator)로 미룬다 —
 * @Valid 로 걸면 REQUIRED_FIELD·LENGTH_EXCEEDED·SELECTION_LIMIT 코드가 INVALID_INPUT 으로 뭉개진다(칩·인물 컨벤션 동일).
 */
data class EventRequest(
    val title: String? = null,
    val why: String? = null,
    val what: String? = null,
    val occurredDate: LocalDate? = null,
    val occurredTime: LocalTime? = null,
    val categoryChipId: Long? = null,
    val weatherChipId: Long? = null,
    val emotionChipIds: List<Long> = emptyList(),
    val personIds: List<Long> = emptyList(),
    val photoUrls: List<String> = emptyList(),
)

/** 칩·인물을 조회에 실을 때의 표현 — id 로 참조하되 라벨·이름을 함께 실어 클라이언트가 바로 그린다(수정 모드 재사용). */
data class ChipRefDto(
    val id: Long,
    val label: String,
)

data class PersonRefDto(
    val id: Long,
    val name: String,
)

data class EventResponse(
    val id: Long,
    // 표시용 최종 제목: 사용자가 입력했으면 그 값, 미입력이면 조회 시점에 계산한 자동 제목(#37).
    val title: String,
    val why: String?,
    val what: String?,
    val occurredDate: LocalDate,
    val occurredTime: LocalTime?,
    val category: ChipRefDto?,
    val weather: ChipRefDto?,
    val emotions: List<ChipRefDto>,
    val persons: List<PersonRefDto>,
    val photoUrls: List<String>,
    val createdAt: LocalDateTime?,
) {
    companion object {
        /**
         * personIds·emotionChipIds 는 EventPerson·EventEmotion 조인 엔티티에서 서비스가 읽은 (순서 보존) id 목록,
         * chipLabels·personNames 는 그 id 로 해석한 (id→라벨/이름) 맵.
         * 소프트삭제된 칩·인물도 라벨·이름은 보인다(과거 참조 보존, 00-infra). personIds 의 첫 번째가 대표 인물.
         */
        fun from(
            event: Event,
            personIds: List<Long>,
            emotionChipIds: List<Long>,
            chipLabels: Map<Long, String>,
            personNames: Map<Long, String>,
        ): EventResponse = EventResponse(
            id = requireNotNull(event.id) { "저장되지 않은 Event는 응답으로 변환할 수 없습니다." },
            title = event.title ?: autoTitle(event, personIds, chipLabels, personNames),
            why = event.why,
            what = event.what,
            occurredDate = event.occurredDate,
            occurredTime = event.occurredTime,
            category = chipLabels[event.categoryChipId]?.let { ChipRefDto(event.categoryChipId, it) },
            weather = event.weatherChipId?.let { id -> chipLabels[id]?.let { ChipRefDto(id, it) } },
            emotions = emotionChipIds.mapNotNull { id -> chipLabels[id]?.let { ChipRefDto(id, it) } },
            persons = personIds.mapNotNull { id -> personNames[id]?.let { PersonRefDto(id, it) } },
            photoUrls = event.photoUrls.toList(),
            createdAt = event.createdAt,
        )

        /**
         * 자동 제목(#37): 대표(첫 번째) 인물 이름과 카테고리로 조합. 단일 `{이름} · {카테고리}`,
         * 다중 `{대표 이름} 외 N명 · {카테고리}`(N = 인물 수 − 1). 저장하지 않고 조회 시 계산하므로 rename 이 자동 반영된다.
         */
        private fun autoTitle(event: Event, personIds: List<Long>, chipLabels: Map<Long, String>, personNames: Map<Long, String>): String {
            val category = chipLabels[event.categoryChipId].orEmpty()
            val representative = personIds.firstOrNull()?.let { personNames[it] }.orEmpty()
            val others = personIds.size - 1
            val who = if (others > 0) "$representative 외 ${others}명" else representative
            return "$who · $category"
        }
    }
}
