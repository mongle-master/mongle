package com.mongle.controller.dto

import com.mongle.domain.Person
import java.time.LocalDate
import java.time.LocalDateTime

/**
 * 등록·수정 공용 요청. 필수는 이름뿐, 나머지는 선택.
 * 빈값·글자수·날짜·태그·취향 검증은 서비스(PersonValidator)로 미룬다 —
 * @Valid 로 걸면 REQUIRED_FIELD·LENGTH_EXCEEDED·SELECTION_LIMIT 코드가 INVALID_INPUT 으로 뭉개진다(칩 컨벤션 동일).
 */
data class PersonRequest(
    val name: String,
    val birthday: BirthdayDto? = null,
    val firstMetDate: LocalDate? = null,
    val lastMetDate: LocalDate? = null,
    val profileImageUrl: String? = null,
    val relationType: String? = null,
    val relationTagChipIds: List<Long> = emptyList(),
    val likes: List<String> = emptyList(),
    val cautions: List<String> = emptyList(),
    val favorite: Boolean = false,
)

/** 생일 연도-선택: 월·일은 함께, 연도는 생략 가능. 셋 다 없으면 요청에서 birthday 자체를 null 로 보낸다. */
data class BirthdayDto(
    val year: Int? = null,
    val month: Int? = null,
    val day: Int? = null,
)

/** 관계 태그를 조회에 포함할 때의 표현 — id 로 참조하되 라벨을 함께 실어 클라이언트가 바로 그린다. */
data class RelationTagDto(
    val id: Long,
    val label: String,
)

data class PersonResponse(
    val id: Long,
    val name: String,
    val birthday: BirthdayDto?,
    val firstMetDate: LocalDate?,
    val lastMetDate: LocalDate?,
    val profileImageUrl: String?,
    val relationType: String?,
    val relationTags: List<RelationTagDto>,
    val likes: List<String>,
    val cautions: List<String>,
    val favorite: Boolean,
    val createdAt: LocalDateTime?,
) {
    companion object {
        /** tagLabels 는 서비스가 칩에서 해석한 (id→라벨) 맵. 소프트삭제된 칩도 라벨은 보인다. */
        fun from(person: Person, tagLabels: Map<Long, String>): PersonResponse = PersonResponse(
            id = requireNotNull(person.id) { "저장되지 않은 Person은 응답으로 변환할 수 없습니다." },
            name = person.name,
            birthday = person.toBirthdayDto(),
            firstMetDate = person.firstMetDate,
            lastMetDate = person.lastMetDate,
            profileImageUrl = person.profileImageUrl,
            relationType = person.relationType,
            relationTags = person.relationTagChipIds.mapNotNull { id ->
                tagLabels[id]?.let { RelationTagDto(id, it) }
            },
            likes = person.likes.toList(),
            cautions = person.cautions.toList(),
            favorite = person.favorite,
            createdAt = person.createdAt,
        )

        private fun Person.toBirthdayDto(): BirthdayDto? = if (birthMonth == null && birthDay == null) null else BirthdayDto(birthYear, birthMonth, birthDay)
    }
}
