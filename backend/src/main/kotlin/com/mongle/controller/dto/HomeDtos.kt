package com.mongle.controller.dto

import com.mongle.service.IntimacyStatus

/**
 * 관계 지도(#40) 응답 — 프론트가 그래프로 그린다.
 * me = 중심 "나" 노드, nodes = 인물, edges = 나↔인물 연결. 인물 간 연결은 PRD 미정의라 만들지 않는다.
 */
data class RelationMapResponse(
    val me: MeNode,
    val nodes: List<PersonNode>,
    val edges: List<RelationEdge>,
) {
    companion object {
        val ME = MeNode()
    }
}

data class MeNode(
    val label: String = "나",
)

/** 인물 노드. 관계태그 라벨은 칩 id 로 해석(소프트삭제 칩도 라벨 유지). 친밀도는 #41. */
data class PersonNode(
    val id: Long,
    val name: String,
    val profileImageUrl: String?,
    val favorite: Boolean,
    val relationTags: List<RelationTagDto>,
    val intimacy: IntimacyDto,
)

/** 나↔인물 연결. distant=멀어진 관계면 프론트가 연결선·이름을 흐리게(#41). */
data class RelationEdge(
    val personId: Long,
    val distant: Boolean,
)

/** 친밀도(#41). status 외 원시값을 함께 실어 프론트가 재활용할 여지를 남긴다. */
data class IntimacyDto(
    val status: IntimacyStatus,
    val averageIntervalDays: Int?,
    val daysSinceLastMeet: Int?,
)
