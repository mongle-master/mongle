package com.mongle.controller.dto

import com.mongle.common.DateDisplay
import com.mongle.domain.Person
import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDate
import java.time.LocalDateTime
import com.mongle.service.PersonStats as PersonStatsData

/**
 * 등록·수정 공용 요청. 필수는 이름뿐, 나머지는 선택.
 * 빈값·글자수·날짜·태그·취향 검증은 서비스(PersonValidator)로 미룬다 —
 * @Valid 로 걸면 REQUIRED_FIELD·LENGTH_EXCEEDED·SELECTION_LIMIT 코드가 INVALID_INPUT 으로 뭉개진다(칩 컨벤션 동일).
 */
@Schema(description = "인물 등록·수정 공용 요청. 이름만 필수이고 나머지는 선택.")
data class PersonRequest(
    @field:Schema(description = "인물 이름(필수).", example = "김하늘")
    val name: String,
    @field:Schema(description = "생일(선택). 월·일은 함께, 연도는 생략 가능.")
    val birthday: Birthday? = null,
    @field:Schema(description = "처음 만난 날(선택). 미래일 수 없다.", example = "2020-03-15")
    val firstMetDate: LocalDate? = null,
    @field:Schema(description = "마지막 만난 날(선택). 처음 만난 날 이후여야 한다.", example = "2026-06-30")
    val lastMetDate: LocalDate? = null,
    @field:Schema(description = "프로필 이미지 URL(이미지 업로드 API 응답의 url).", example = "/images/p7.jpg")
    val profileImageUrl: String? = null,
    @field:Schema(description = "기본 아바타 선택용 성별 힌트(선택).", example = "FEMALE")
    val gender: PersonGender? = null,
    @field:Schema(description = "관계 유형 자유 서술(선택).", example = "대학 동기")
    val relationType: String? = null,
    @field:Schema(description = "관계태그 칩 id 목록. 선택 개수 상한이 있다.", example = "[11, 12]")
    val relationTagChipIds: List<Long> = emptyList(),
    @field:Schema(description = "좋아하는 것(선택). 취향 목록.", example = "[\"커피\", \"러닝\"]")
    val likes: List<String> = emptyList(),
    @field:Schema(description = "주의할 것(선택). 취향 목록.", example = "[\"견과류 알레르기\"]")
    val cautions: List<String> = emptyList(),
    @field:Schema(description = "즐겨찾기 여부.", example = "false")
    val favorite: Boolean = false,
)

/** 디렉토리 정렬. 어느 정렬이든 즐겨찾기는 항상 상단 그룹으로 뜬다(#29). */
@Schema(description = "인물 디렉토리 정렬. NAME=가나다, RECENT=최근 순. 어느 정렬이든 즐겨찾기는 항상 상단 그룹.")
enum class PersonSort {
    NAME,
    RECENT,
}

/** 생일 연도-선택: 월·일은 함께, 연도는 생략 가능. 셋 다 없으면 요청에서 birthday 자체를 null 로 보낸다. */
@Schema(description = "생일. 월·일은 함께, 연도는 생략 가능. 월·일이 모두 없으면 생일 없음으로 본다.")
data class Birthday(
    @field:Schema(description = "연도(생략 가능).", example = "1995")
    val year: Int? = null,
    @field:Schema(description = "월(1~12).", example = "4")
    val month: Int? = null,
    @field:Schema(description = "일(1~31).", example = "20")
    val day: Int? = null,
) {
    companion object {
        /** 월·일이 모두 없으면 생일 없음(null). 응답 변환들이 공유한다. */
        fun from(person: Person): Birthday? = if (person.birthMonth == null && person.birthDay == null) null else Birthday(person.birthYear, person.birthMonth, person.birthDay)
    }
}

@Schema(description = "인물 응답. 관계태그는 요약 참조로 실어 클라이언트가 재조회 없이 그린다.")
data class PersonResponse(
    @field:Schema(description = "인물 id.", example = "7")
    val id: Long,
    @field:Schema(description = "인물 이름.", example = "김하늘")
    val name: String,
    @field:Schema(description = "생일(없을 수 있음).")
    val birthday: Birthday?,
    @field:Schema(description = "처음 만난 날(없을 수 있음).", example = "2020-03-15")
    val firstMetDate: LocalDate?,
    @field:Schema(description = "마지막 만난 날(없을 수 있음).", example = "2026-06-30")
    val lastMetDate: LocalDate?,
    @field:Schema(description = "프로필 이미지 URL(없을 수 있음).", example = "/images/p7.jpg")
    val profileImageUrl: String?,
    @field:Schema(description = "기본 아바타 선택용 성별 힌트(없을 수 있음).", example = "FEMALE")
    val gender: PersonGender?,
    @field:Schema(description = "관계 유형(없을 수 있음).", example = "대학 동기")
    val relationType: String?,
    @field:Schema(description = "관계태그 칩 요약 참조 목록.")
    val relationTags: List<ChipRef>,
    @field:Schema(description = "좋아하는 것 목록.", example = "[\"커피\", \"러닝\"]")
    val likes: List<String>,
    @field:Schema(description = "주의할 것 목록.", example = "[\"견과류 알레르기\"]")
    val cautions: List<String>,
    @field:Schema(description = "즐겨찾기 여부.", example = "true")
    val favorite: Boolean,
    @field:Schema(description = "등록 시각.", example = "2026-01-10T09:00:00")
    val createdAt: LocalDateTime?,
) {
    companion object {
        /**
         * relationTagChipIds 는 PersonRelationTag 조인 엔티티에서 서비스가 읽은 (순서 보존) 칩 id 목록,
         * tagDisplays 는 그 칩에서 해석한 (id→표시정보) 맵. 소프트삭제된 칩도 라벨은 보인다.
         */
        fun from(person: Person, relationTagChipIds: List<Long>, tagDisplays: Map<Long, ChipDisplay>): PersonResponse = PersonResponse(
            id = requireNotNull(person.id) { "저장되지 않은 Person은 응답으로 변환할 수 없습니다." },
            name = person.name,
            birthday = Birthday.from(person),
            firstMetDate = person.firstMetDate,
            lastMetDate = person.lastMetDate,
            profileImageUrl = person.profileImageUrl,
            gender = person.gender?.let { PersonGender.valueOf(it.name) },
            relationType = person.relationType,
            relationTags = relationTagChipIds.mapNotNull { id ->
                tagDisplays[id]?.let { ChipRef(id, it.label, it.color) }
            },
            likes = person.likes.toList(),
            cautions = person.cautions.toList(),
            favorite = person.favorite,
            createdAt = person.createdAt,
        )
    }
}

/**
 * 인물 파생 스탯 섹션(#30). 원시값과 표시 문자열을 함께 실어 프론트가 골라 쓰게 한다.
 * 값이 없으면(근거 날짜 부재) null — 조회 화면은 해당 행을 숨긴다(§7).
 */
@Schema(description = "인물 파생 스탯. 원시값과 표시 문자열을 함께 싣고, 근거 날짜가 없으면 null(화면은 해당 행을 숨김).")
data class PersonStats(
    @field:Schema(description = "만남 횟수(만남 카테고리 기록 수).", example = "12")
    val meetCount: Int,
    @field:Schema(description = "전체 기록 수.", example = "20")
    val recordCount: Int,
    @field:Schema(description = "처음 만난 날로부터 경과일. 처음 만난 날이 없으면 null.", example = "2305")
    val daysSinceFirstMet: Int?,
    @field:Schema(description = "알고 지낸 기간 표시 문자열. 처음 만난 날이 없으면 null.", example = "6년 3개월")
    val acquaintancePeriod: String?,
    @field:Schema(description = "마지막 만남 상대 시간 표시 문자열. 근거가 없으면 null.", example = "6일 전")
    val lastMetRelative: String?,
) {
    companion object {
        fun from(person: Person, stats: PersonStatsData, today: LocalDate): PersonStats = PersonStats(
            meetCount = stats.meetCount,
            recordCount = stats.recordCount,
            daysSinceFirstMet = person.firstMetDate?.let { DateDisplay.daysSinceFirstMet(it, today) },
            acquaintancePeriod = person.firstMetDate?.let { DateDisplay.acquaintancePeriod(it, today) },
            lastMetRelative = stats.lastMetDate?.let { DateDisplay.relativeTime(it, today) },
        )
    }
}

/**
 * 상세 조회(#25) 전용 응답 — 기본 정보에 파생 스탯 섹션을 더한다.
 * lastMetDate 는 저장 필드가 아니라 **재계산값**(수기+이벤트 max)을 실어 표시 truth 를 단일화한다.
 */
@Schema(description = "인물 상세 응답. 기본 정보에 파생 스탯 섹션을 더한다. lastMetDate 는 수기+기록 max 재계산값.")
data class PersonDetailResponse(
    @field:Schema(description = "인물 id.", example = "7")
    val id: Long,
    @field:Schema(description = "인물 이름.", example = "김하늘")
    val name: String,
    @field:Schema(description = "생일(없을 수 있음).")
    val birthday: Birthday?,
    @field:Schema(description = "처음 만난 날(없을 수 있음).", example = "2020-03-15")
    val firstMetDate: LocalDate?,
    @field:Schema(description = "마지막 만난 날. 수기 입력과 기록의 max 를 재계산한 값.", example = "2026-06-30")
    val lastMetDate: LocalDate?,
    @field:Schema(description = "프로필 이미지 URL(없을 수 있음).", example = "/images/p7.jpg")
    val profileImageUrl: String?,
    @field:Schema(description = "기본 아바타 선택용 성별 힌트(없을 수 있음).", example = "FEMALE")
    val gender: PersonGender?,
    @field:Schema(description = "관계 유형(없을 수 있음).", example = "대학 동기")
    val relationType: String?,
    @field:Schema(description = "관계태그 칩 요약 참조 목록.")
    val relationTags: List<ChipRef>,
    @field:Schema(description = "좋아하는 것 목록.", example = "[\"커피\", \"러닝\"]")
    val likes: List<String>,
    @field:Schema(description = "주의할 것 목록.", example = "[\"견과류 알레르기\"]")
    val cautions: List<String>,
    @field:Schema(description = "즐겨찾기 여부.", example = "true")
    val favorite: Boolean,
    @field:Schema(description = "등록 시각.", example = "2026-01-10T09:00:00")
    val createdAt: LocalDateTime?,
    @field:Schema(description = "파생 스탯 섹션.")
    val stats: PersonStats,
) {
    companion object {
        fun from(
            person: Person,
            stats: PersonStatsData,
            relationTagChipIds: List<Long>,
            tagDisplays: Map<Long, ChipDisplay>,
            today: LocalDate,
        ): PersonDetailResponse = PersonDetailResponse(
            id = requireNotNull(person.id) { "저장되지 않은 Person은 응답으로 변환할 수 없습니다." },
            name = person.name,
            birthday = Birthday.from(person),
            firstMetDate = person.firstMetDate,
            lastMetDate = stats.lastMetDate,
            profileImageUrl = person.profileImageUrl,
            gender = person.gender?.let { PersonGender.valueOf(it.name) },
            relationType = person.relationType,
            relationTags = relationTagChipIds.mapNotNull { id -> tagDisplays[id]?.let { ChipRef(id, it.label, it.color) } },
            likes = person.likes.toList(),
            cautions = person.cautions.toList(),
            favorite = person.favorite,
            createdAt = person.createdAt,
            stats = PersonStats.from(person, stats, today),
        )
    }
}

@Schema(description = "기본 아바타 선택용 성별 힌트.")
enum class PersonGender {
    FEMALE,
    MALE,
}
