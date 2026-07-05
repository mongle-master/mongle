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
import java.time.LocalDate

@Service
@Transactional(readOnly = true)
class HomeService(
    private val personRepository: PersonRepository,
    private val chipRepository: ChipRepository,
    private val personStatsService: PersonStatsService,
) {
    /**
     * 관계 지도(#40 #41 #42). 내 소유·active 인물을 노드로, 나↔인물을 엣지로 낸다.
     * 노드 정렬은 즐겨찾기 먼저 → 이름순(그래프 표시 결정성). 관계 점수화·서열화가 아니다.
     * 친밀도(#41)는 그 인물 만남 고유 날짜(파생 스탯)로 판정하고, 멀어짐이면 엣지를 흐리게 표시하도록 내린다.
     * 관계태그 필터(#42)는 합집합(OR) — 하나라도 가진 인물을 남긴다(넓혀 보기). 빈 필터는 전체. 흐린 표시는 멀어짐 전용이라 섞지 않고, 조건 밖 인물은 아예 뺀다.
     */
    fun relationMap(userId: Long, filterTagChipIds: List<Long>): RelationMapResponse {
        val today = LocalDate.now()
        val filter = filterTagChipIds.toSet()
        val persons = personRepository.findByOwnerIdAndDeletedAtIsNull(userId)
            .filter { filter.isEmpty() || it.relationTagChipIds.any(filter::contains) }
            .sortedWith(compareByDescending<Person> { it.favorite }.thenBy(String.CASE_INSENSITIVE_ORDER) { it.name })

        val tagLabels = resolveTagLabels(persons)
        val nodes = persons.map { person ->
            val intimacy = Intimacy.of(personStatsService.statsOf(person).meetingDatesDesc, today)
            PersonNode(
                id = requireNotNull(person.id),
                name = person.name,
                profileImageUrl = person.profileImageUrl,
                favorite = person.favorite,
                relationTags = person.relationTagChipIds.mapNotNull { id -> tagLabels[id]?.let { RelationTagDto(id, it) } },
                intimacy = IntimacyDto(intimacy.status, intimacy.averageIntervalDays, intimacy.daysSinceLastMeet),
            )
        }
        val edges = nodes.map { RelationEdge(personId = it.id, distant = it.intimacy.status == IntimacyStatus.DISTANT) }
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
