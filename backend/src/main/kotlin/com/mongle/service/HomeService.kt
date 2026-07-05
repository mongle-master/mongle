package com.mongle.service

import com.mongle.controller.dto.IntimacyDto
import com.mongle.controller.dto.MeNode
import com.mongle.controller.dto.PersonNode
import com.mongle.controller.dto.RelationEdge
import com.mongle.controller.dto.RelationMapResponse
import com.mongle.controller.dto.RelationTagDto
import com.mongle.domain.Person
import com.mongle.repository.ChipRepository
import com.mongle.repository.PersonRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class HomeService(
    private val personRepository: PersonRepository,
    private val chipRepository: ChipRepository,
) {
    /**
     * 관계 지도(#40). 내 소유·active 인물을 노드로, 나↔인물을 엣지로 낸다.
     * 노드 정렬은 즐겨찾기 먼저 → 이름순(그래프 표시 결정성). 관계 점수화·서열화가 아니다.
     * 친밀도는 이 단계에선 판정 보류(UNKNOWN) 기본값 — 판정은 #41에서 채운다.
     */
    fun relationMap(userId: Long): RelationMapResponse {
        val persons = personRepository.findByOwnerIdAndDeletedAtIsNull(userId)
            .sortedWith(compareByDescending<Person> { it.favorite }.thenBy(String.CASE_INSENSITIVE_ORDER) { it.name })

        val tagLabels = resolveTagLabels(persons)
        val nodes = persons.map { person ->
            PersonNode(
                id = requireNotNull(person.id),
                name = person.name,
                profileImageUrl = person.profileImageUrl,
                favorite = person.favorite,
                relationTags = person.relationTagChipIds.mapNotNull { id -> tagLabels[id]?.let { RelationTagDto(id, it) } },
                intimacy = IntimacyDto(IntimacyStatus.UNKNOWN, averageIntervalDays = null, daysSinceLastMeet = null),
            )
        }
        val edges = nodes.map { RelationEdge(personId = it.id, distant = false) }
        return RelationMapResponse(me = MeNode(), nodes = nodes, edges = edges)
    }

    /**
     * 여러 인물의 관계태그 라벨을 한 번에 해석한다 — id 참조라 rename 이 자동 반영되고,
     * 소프트삭제된 칩도 findAllById 로 잡혀 라벨이 유지된다(과거 참조 보존, 00-infra).
     */
    private fun resolveTagLabels(persons: List<Person>): Map<Long, String> {
        val tagIds = persons.flatMap { it.relationTagChipIds }.distinct()
        return chipRepository.findAllById(tagIds).mapNotNull { chip -> chip.id?.let { it to chip.label } }.toMap()
    }
}
