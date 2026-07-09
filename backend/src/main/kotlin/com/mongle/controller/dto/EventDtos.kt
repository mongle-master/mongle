package com.mongle.controller.dto

import com.mongle.domain.Event
import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

/**
 * 등록·수정 공용 요청. 필수는 연결 인물(≥1)뿐 — 카테고리·날짜는 미지정 시 기본값(만남·오늘)으로 채운다.
 * 빈값·글자수·개수·소속(내 인물·보이는 칩)·날짜 검증은 서비스(EventValidator)로 미룬다 —
 * @Valid 로 걸면 REQUIRED_FIELD·LENGTH_EXCEEDED·SELECTION_LIMIT 코드가 INVALID_INPUT 으로 뭉개진다(칩·인물 컨벤션 동일).
 */
@Schema(description = "기록 등록·수정 공용 요청. 함께한 사람(personIds)만 필수이고, 카테고리·날짜는 미지정 시 만남·오늘로 채운다.")
data class EventRequest(
    @field:Schema(description = "기록 제목. 미입력하면 조회 시 '대표 인물 · 카테고리'로 자동 제목을 만든다.", example = "한강 산책")
    val title: String? = null,
    @field:Schema(description = "메모(함께한 이야기) 자유 서술.", example = "오랜만에 얼굴 보고 한강에서 두 시간 걸었다")
    val memo: String? = null,
    @field:Schema(description = "기록한 일이 일어난 날짜. 미지정 시 오늘로 채운다. 미래일 수 없다.", example = "2026-07-05")
    val occurredDate: LocalDate? = null,
    @field:Schema(description = "일어난 시각(선택).", example = "19:30:00")
    val occurredTime: LocalTime? = null,
    @field:Schema(description = "카테고리 칩 id. 미지정 시 기본 카테고리(만남)로 채운다.", example = "3")
    val categoryChipId: Long? = null,
    @field:Schema(description = "날씨 칩 id(선택).", example = "8")
    val weatherChipId: Long? = null,
    @field:Schema(description = "감정 칩 id 목록. 선택 개수 상한이 있다.", example = "[5, 6]")
    val emotionChipIds: List<Long> = emptyList(),
    @field:Schema(description = "함께한 사람 id 목록(최소 1명). 첫 번째가 대표 인물이 된다.", example = "[7, 9]")
    val personIds: List<Long> = emptyList(),
    @field:Schema(description = "첨부 사진 URL 목록(이미지 업로드 API 응답의 url).", example = "[\"/images/a1b2.jpg\"]")
    val photoUrls: List<String> = emptyList(),
)

@Schema(description = "기록 응답. 칩·인물은 요약 참조로 실어 클라이언트가 재조회 없이 그린다.")
data class EventResponse(
    @field:Schema(description = "기록 id.", example = "21")
    val id: Long,
    // 표시용 최종 제목: 사용자가 입력했으면 그 값, 미입력이면 조회 시점에 계산한 자동 제목(#37).
    @field:Schema(description = "표시용 최종 제목. 사용자가 입력했으면 그 값, 아니면 '대표 인물 · 카테고리' 자동 제목.", example = "김하늘 · 만남")
    val title: String,
    @field:Schema(description = "메모(함께한 이야기).", example = "오랜만에 얼굴 보고 한강에서 두 시간 걸었다")
    val memo: String?,
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
    @field:Schema(description = "함께한 사람 요약 참조 목록. 첫 번째가 대표 인물.")
    val persons: List<PersonRef>,
    @field:Schema(description = "첨부 사진 URL 목록.", example = "[\"/images/a1b2.jpg\"]")
    val photoUrls: List<String>,
    @field:Schema(description = "기록 생성 시각.", example = "2026-07-05T20:10:00")
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
            memo = event.memo,
            occurredDate = event.occurredDate,
            occurredTime = event.occurredTime,
            category = chipLabels[event.categoryChipId]?.let { ChipRef(event.categoryChipId, it) },
            weather = event.weatherChipId?.let { id -> chipLabels[id]?.let { ChipRef(id, it) } },
            emotions = emotionChipIds.mapNotNull { id -> chipLabels[id]?.let { ChipRef(id, it) } },
            persons = personIds.mapNotNull { id -> personNames[id]?.let { PersonRef(id, it) } },
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
