package com.mongle.controller.dto

import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDate
import java.util.UUID

/**
 * 관계 지도(#40) 응답 — 프론트가 그래프로 그린다.
 * me = 중심 "나" 노드, nodes = 인물, edges = 나↔인물 연결, bonds = 인물↔인물 '사이'.
 * edges 와 bonds 는 다른 축이라 한 배열에 섞지 않는다 — 흐린 표시(distant)는 edges 에만 있는 개념이다.
 */
@Schema(description = "관계 지도 응답 — 중심 '나' 노드, 인물 노드, 나↔인물 연결선, 인물↔인물 '사이'로 그래프를 그린다.")
data class RelationMapResponse(
    @field:Schema(description = "그래프 중심의 '나' 노드.")
    val me: MeNode,
    @field:Schema(description = "인물 노드 목록.")
    val nodes: List<PersonNode>,
    @field:Schema(description = "나↔인물 연결선 목록.")
    val edges: List<RelationEdge>,
    @field:Schema(description = "인물↔인물 '사이' 목록. 양쪽 끝이 모두 nodes 에 있는 것만 담는다.")
    val bonds: List<BondEdge>,
)

@Schema(description = "관계 지도 중심의 '나' 노드.")
data class MeNode(
    @field:Schema(description = "중심 노드 표시 라벨.", example = "나")
    val label: String = "나",
    @field:Schema(description = "사용자 UUID.", example = "8e0ca8f5-a713-4a90-9df1-15f0be0d843c")
    val id: UUID,
    @field:Schema(description = "사용자 표시 이름.", example = "성빈")
    val name: String,
    @field:Schema(description = "사용자 프로필 이미지 URL(없을 수 있음).", example = "/images/me.jpg", nullable = true)
    val profileImageUrl: String?,
    @field:Schema(description = "기본 아바타 성별 힌트.", example = "MALE", nullable = true)
    val avatarGender: AvatarGender?,
)

/** 인물 노드. 관계태그 라벨은 칩 id 로 해석(소프트삭제 칩도 라벨 유지). 친밀도는 #41. */
@Schema(description = "관계 지도의 인물 노드.")
data class PersonNode(
    @field:Schema(description = "인물 id.", example = "7")
    val id: Long,
    @field:Schema(description = "인물 이름.", example = "김하늘")
    val name: String,
    @field:Schema(description = "프로필 이미지 URL(없을 수 있음).", example = "/images/p7.jpg", nullable = true)
    val profileImageUrl: String?,
    @field:Schema(description = "기본 아바타 성별 힌트. 프로필 이미지가 없을 때 클라이언트가 기본 이미지 선택에 사용한다.", example = "FEMALE", nullable = true)
    val avatarGender: AvatarGender?,
    @field:Schema(description = "즐겨찾기 여부.", example = "true")
    val favorite: Boolean,
    @field:Schema(description = "이 인물과 함께 새긴 기록 수. 프론트가 관계 지도 노드 크기 표현에 사용한다.", example = "12")
    val recordCount: Int,
    @field:Schema(description = "이 인물에 붙은 관계태그 칩 요약 참조 목록.")
    val relationTags: List<ChipRef>,
    @field:Schema(description = "친밀도 판정 결과.")
    val intimacy: Intimacy,
    @field:Schema(description = "처음 만난 날(없을 수 있음).", example = "2023-07-07", nullable = true)
    val firstMetDate: LocalDate?,
)

@Schema(description = "기본 아바타 성별 힌트.")
enum class AvatarGender {
    FEMALE,
    MALE,
}

/** 나↔인물 연결. distant=멀어진 관계면 프론트가 연결선·이름을 흐리게(#41). */
@Schema(description = "나↔인물 연결선. distant 면 프론트가 연결선·이름을 흐리게 그린다.")
data class RelationEdge(
    @field:Schema(description = "연결 대상 인물 id.", example = "7")
    val personId: Long,
    @field:Schema(description = "멀어진 관계 여부.", example = "false")
    val distant: Boolean,
)

/**
 * 인물↔인물 '사이'. 방향이 없어 personAId < personBId 로 눕혀 내린다(PersonBond).
 * id 는 프론트가 끊기(DELETE)를 호출할 때 쓴다. distant 가 없는 것은 의도 — 흐린 표시는 나↔인물 전용이다.
 */
@Schema(description = "인물↔인물 '사이'. personAId < personBId 로 눕혀 내리며, id 로 끊기를 호출한다.")
data class BondEdge(
    @field:Schema(description = "사이 id. 끊기(DELETE /api/v1/person-bonds/{id})에 쓴다.", example = "5")
    val id: Long,
    @field:Schema(description = "한쪽 인물 id(작은 쪽).", example = "3")
    val personAId: Long,
    @field:Schema(description = "다른 쪽 인물 id(큰 쪽).", example = "9")
    val personBId: Long,
)

/** 친밀도 판정 상태(#41). UNKNOWN=주기를 알 수 없어 판정 보류(멀어짐 아님). */
@Schema(description = "친밀도 판정 상태. UNKNOWN=주기를 알 수 없어 판정 보류(멀어짐 아님), NORMAL=정상, DISTANT=멀어짐.")
enum class IntimacyStatus {
    UNKNOWN,
    NORMAL,
    DISTANT,
}

/** 친밀도(#41). status 외 원시값을 함께 실어 프론트가 재활용할 여지를 남긴다. 판정은 IntimacyCalculator. */
@Schema(description = "친밀도. 판정 상태와 함께 근거 원시값(평균 만남 주기·마지막 만남 경과일)을 싣는다.")
data class Intimacy(
    @field:Schema(description = "친밀도 판정 상태.", example = "NORMAL")
    val status: IntimacyStatus,
    @field:Schema(description = "만남 간 평균 주기(일). 근거가 부족하면 null.", example = "14", nullable = true)
    val averageIntervalDays: Int?,
    @field:Schema(description = "마지막 만남 이후 경과일. 근거가 부족하면 null.", example = "9", nullable = true)
    val daysSinceLastMeet: Int?,
)

/**
 * 1년 전 오늘 회고(#43) — 조건 충족 시 1건, 없으면 컨트롤러가 204.
 * title 은 사용자가 입력한 제목만(없으면 null). 자동 제목(#37)을 쓰지 않는다 —
 * 회고 카드 폴백 문구가 자동 제목과 달라 프론트가 null 을 직접 폴백 처리한다(PRD 01 §5).
 */
@Schema(description = "1년 전 오늘 회고 카드. 조건을 만족하는 기록이 없으면 응답 본문 없이 204.")
data class ThrowbackResponse(
    @field:Schema(description = "회고 대상 기록 id.", example = "21")
    val eventId: Long,
    @field:Schema(description = "대표 인물 id.", example = "7")
    val personId: Long,
    @field:Schema(description = "대표 인물 이름.", example = "김하늘")
    val personName: String,
    @field:Schema(description = "사용자가 입력한 제목만(자동 제목은 쓰지 않음). 없으면 null 이라 프론트가 폴백 문구를 넣는다.", example = "한강 산책", nullable = true)
    val title: String?,
    @field:Schema(description = "1년 전 그날의 날짜.", example = "2025-07-06")
    val occurredDate: LocalDate,
    @field:Schema(description = "대표 사진 URL(없을 수 있음).", example = "/images/a1b2.jpg", nullable = true)
    val photoUrl: String?,
)
