package com.mongle.service

import com.mongle.controller.dto.AvatarGender
import com.mongle.controller.dto.ChipDisplay
import com.mongle.controller.dto.ChipRef
import com.mongle.controller.dto.IntimacyStatus
import com.mongle.controller.dto.MeNode
import com.mongle.controller.dto.PersonNode
import com.mongle.controller.dto.RelationEdge
import com.mongle.controller.dto.RelationMapResponse
import com.mongle.controller.dto.ThrowbackResponse
import com.mongle.domain.ChipType
import com.mongle.domain.Event
import com.mongle.domain.Person
import com.mongle.repository.ChipRepository
import com.mongle.repository.EventRepository
import com.mongle.repository.PersonRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalTime

@Service
@Transactional(readOnly = true)
class HomeService(
    private val personRepository: PersonRepository,
    private val chipRepository: ChipRepository,
    private val personStatsService: PersonStatsService,
    private val eventRepository: EventRepository,
    private val personService: PersonService,
    private val eventService: EventService,
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
        // 관계태그(조인 엔티티)는 필터·표시 양쪽에 쓰이므로 전체 인물분을 한 번에 로드한 뒤 필터한다.
        val all = personRepository.findByOwnerIdAndDeletedAtIsNull(userId)
        val tagChipIdsByPerson = personService.relationTagChipIdsByPerson(all)
        val persons = all
            .filter { filter.isEmpty() || tagChipIdsByPerson[it.id].orEmpty().any(filter::contains) }
            // 최종 타이브레이커 id 오름차순 — 동명이인이 있어도 조회마다 노드 순서가 흔들리지 않게(표시 결정성).
            .sortedWith(compareByDescending<Person> { it.favorite }.thenBy(String.CASE_INSENSITIVE_ORDER) { it.name }.thenBy { it.id })

        val tagDisplays = resolveTagDisplays(tagChipIdsByPerson.values.flatten())
        val nodes = persons.map { person ->
            val stats = personStatsService.statsOf(person)
            val intimacy = IntimacyCalculator.of(stats.meetingDatesDesc, today)
            PersonNode(
                id = requireNotNull(person.id),
                name = person.name,
                profileImageUrl = person.profileImageUrl,
                avatarGender = person.gender?.let { AvatarGender.valueOf(it.name) },
                favorite = person.favorite,
                recordCount = stats.recordCount,
                relationTags = tagChipIdsByPerson[person.id].orEmpty().mapNotNull { id -> tagDisplays[id]?.let { ChipRef(id, it.label, it.color) } },
                intimacy = intimacy,
                firstMetDate = person.firstMetDate,
            )
        }
        val edges = nodes.map { RelationEdge(personId = it.id, distant = it.intimacy.status == IntimacyStatus.DISTANT) }
        return RelationMapResponse(me = MeNode(), nodes = nodes, edges = edges)
    }

    /**
     * 1년 전 오늘 회고(#43). 기록 occurredDate 가 정확히 1년 전(같은 월·일, 연도=올해−1)인 기록만 대상.
     * 카드 문구가 "1년 전 오늘"이라 여러 해 전 기록은 포함하지 않는다.
     * 윤년 2/29: 오늘이 2/29 여도 작년(비윤년)엔 2/29 기록이 있을 수 없어 연도 필터로 자연히 빈 결과가 된다(PRD §5 미노출).
     * 복수면 우선순위 ①즐겨찾기 인물 →②사진 →③기념일 카테고리 →④이른 시각(없으면 뒤) →⑤먼저 남긴 것(id) 로 1건.
     */
    fun throwback(userId: Long): ThrowbackResponse? {
        val today = LocalDate.now()
        val lastYear = today.year - 1
        val candidates = eventRepository.findByOwnerIdAndMonthDay(userId, today.monthValue, today.dayOfMonth)
            .filter { it.occurredDate.year == lastYear }
        if (candidates.isEmpty()) return null

        // 후보 기록의 연결 인물(순서 보존)을 한 번에 로드 — 우선순위 판정(즐겨찾기)·대표 이름에 재사용.
        val personIdsByEvent = eventService.personIdsByEvent(candidates)
        // 우선순위 판정에 필요한 인물(즐겨찾기·대표 이름)을 후보 전체 인물 id 로 한 번에 로드(소프트삭제 포함, 과거 참조 이름 보존).
        val persons = personRepository.findAllById(personIdsByEvent.values.flatten().distinct())
            .mapNotNull { p -> p.id?.let { it to p } }.toMap()
        val favoriteIds = persons.filterValues { it.favorite }.keys
        val anniversaryChipId = chipRepository.findByTypeAndOwnerIdIsNullAndLabelAndDeletedAtIsNull(ChipType.CATEGORY, ANNIVERSARY_CATEGORY_LABEL)?.id

        val selected = candidates.sortedWith(
            compareByDescending<Event> { ev -> personIdsByEvent[ev.id].orEmpty().any(favoriteIds::contains) }
                .thenByDescending { it.photoUrls.isNotEmpty() }
                .thenByDescending { anniversaryChipId != null && it.categoryChipId == anniversaryChipId }
                .thenBy(nullsLast<LocalTime>()) { it.occurredTime }
                .thenBy { it.id },
        ).first()

        val representativeId = personIdsByEvent.getValue(requireNotNull(selected.id)).first()
        return ThrowbackResponse(
            eventId = requireNotNull(selected.id),
            personId = representativeId,
            personName = persons[representativeId]?.name.orEmpty(),
            title = selected.title,
            occurredDate = selected.occurredDate,
            photoUrl = selected.photoUrls.firstOrNull(),
        )
    }

    /**
     * 관계태그 칩 id 목록의 라벨을 한 번에 해석한다 — id 참조라 rename 이 자동 반영되고,
     * 소프트삭제된 칩도 findAllById 로 잡혀 라벨이 유지된다(과거 참조 보존, 00-infra).
     */
    private fun resolveTagDisplays(chipIds: List<Long>): Map<Long, ChipDisplay> = chipRepository.findAllById(chipIds.distinct()).mapNotNull { chip -> chip.id?.let { it to ChipDisplay(chip.label, chip.color) } }.toMap()

    companion object {
        // 회고 우선순위 ③(기념일) 판정용 공통 카테고리 라벨. ChipSeeder 의 CATEGORY 시드와 동일해야 한다.
        private const val ANNIVERSARY_CATEGORY_LABEL = "기념일"
    }
}
