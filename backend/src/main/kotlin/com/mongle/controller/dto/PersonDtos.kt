package com.mongle.controller.dto

import com.mongle.common.DateDisplay
import com.mongle.domain.Person
import java.time.LocalDate
import java.time.LocalDateTime
import com.mongle.service.PersonStats as PersonStatsData

/**
 * 등록·수정 공용 요청. 필수는 이름뿐, 나머지는 선택.
 * 빈값·글자수·날짜·태그·취향 검증은 서비스(PersonValidator)로 미룬다 —
 * @Valid 로 걸면 REQUIRED_FIELD·LENGTH_EXCEEDED·SELECTION_LIMIT 코드가 INVALID_INPUT 으로 뭉개진다(칩 컨벤션 동일).
 */
data class PersonRequest(
    val name: String,
    val birthday: Birthday? = null,
    val firstMetDate: LocalDate? = null,
    val lastMetDate: LocalDate? = null,
    val profileImageUrl: String? = null,
    val relationType: String? = null,
    val relationTagChipIds: List<Long> = emptyList(),
    val likes: List<String> = emptyList(),
    val cautions: List<String> = emptyList(),
    val favorite: Boolean = false,
)

/** 디렉토리 정렬. 어느 정렬이든 즐겨찾기는 항상 상단 그룹으로 뜬다(#29). */
enum class PersonSort {
    NAME,
    RECENT,
}

/** 생일 연도-선택: 월·일은 함께, 연도는 생략 가능. 셋 다 없으면 요청에서 birthday 자체를 null 로 보낸다. */
data class Birthday(
    val year: Int? = null,
    val month: Int? = null,
    val day: Int? = null,
) {
    companion object {
        /** 월·일이 모두 없으면 생일 없음(null). 응답 변환들이 공유한다. */
        fun from(person: Person): Birthday? = if (person.birthMonth == null && person.birthDay == null) null else Birthday(person.birthYear, person.birthMonth, person.birthDay)
    }
}

data class PersonResponse(
    val id: Long,
    val name: String,
    val birthday: Birthday?,
    val firstMetDate: LocalDate?,
    val lastMetDate: LocalDate?,
    val profileImageUrl: String?,
    val relationType: String?,
    val relationTags: List<ChipRef>,
    val likes: List<String>,
    val cautions: List<String>,
    val favorite: Boolean,
    val createdAt: LocalDateTime?,
) {
    companion object {
        /**
         * relationTagChipIds 는 PersonRelationTag 조인 엔티티에서 서비스가 읽은 (순서 보존) 칩 id 목록,
         * tagLabels 는 그 칩에서 해석한 (id→라벨) 맵. 소프트삭제된 칩도 라벨은 보인다.
         */
        fun from(person: Person, relationTagChipIds: List<Long>, tagLabels: Map<Long, String>): PersonResponse = PersonResponse(
            id = requireNotNull(person.id) { "저장되지 않은 Person은 응답으로 변환할 수 없습니다." },
            name = person.name,
            birthday = Birthday.from(person),
            firstMetDate = person.firstMetDate,
            lastMetDate = person.lastMetDate,
            profileImageUrl = person.profileImageUrl,
            relationType = person.relationType,
            relationTags = relationTagChipIds.mapNotNull { id ->
                tagLabels[id]?.let { ChipRef(id, it) }
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
data class PersonStats(
    val meetCount: Int,
    val recordCount: Int,
    val daysSinceFirstMet: Int?,
    val acquaintancePeriod: String?,
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
data class PersonDetailResponse(
    val id: Long,
    val name: String,
    val birthday: Birthday?,
    val firstMetDate: LocalDate?,
    val lastMetDate: LocalDate?,
    val profileImageUrl: String?,
    val relationType: String?,
    val relationTags: List<ChipRef>,
    val likes: List<String>,
    val cautions: List<String>,
    val favorite: Boolean,
    val createdAt: LocalDateTime?,
    val stats: PersonStats,
) {
    companion object {
        fun from(
            person: Person,
            stats: PersonStatsData,
            relationTagChipIds: List<Long>,
            tagLabels: Map<Long, String>,
            today: LocalDate,
        ): PersonDetailResponse = PersonDetailResponse(
            id = requireNotNull(person.id) { "저장되지 않은 Person은 응답으로 변환할 수 없습니다." },
            name = person.name,
            birthday = Birthday.from(person),
            firstMetDate = person.firstMetDate,
            lastMetDate = stats.lastMetDate,
            profileImageUrl = person.profileImageUrl,
            relationType = person.relationType,
            relationTags = relationTagChipIds.mapNotNull { id -> tagLabels[id]?.let { ChipRef(id, it) } },
            likes = person.likes.toList(),
            cautions = person.cautions.toList(),
            favorite = person.favorite,
            createdAt = person.createdAt,
            stats = PersonStats.from(person, stats, today),
        )
    }
}
