package com.mongle.service

import com.mongle.common.exception.BusinessException
import com.mongle.common.exception.ErrorCode
import com.mongle.controller.dto.ActivityFlowLane
import com.mongle.controller.dto.ActivityFlowResponse
import com.mongle.controller.dto.ActivityLane
import com.mongle.controller.dto.EventResponse
import com.mongle.controller.dto.MyTimelineCard
import com.mongle.controller.dto.MyTimelineMonthGroup
import com.mongle.controller.dto.MyTimelineResponse
import com.mongle.controller.dto.TimelinePersonRef
import com.mongle.domain.Event
import com.mongle.domain.Person
import com.mongle.repository.EventRepository
import com.mongle.repository.PersonRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.YearMonth

/**
 * 타임라인 조회(#44 사람별 피드·#45 활동 흐름·#46 전체 타임라인).
 * 카드 표현·자동 제목(#37)은 EventService.toResponses 를 재사용하고, 여기서는 필터·그룹·집계만 얹는다.
 * 필터는 목록에만 적용한다(활동 흐름·통계는 전체) — PRD 03·05 §4.
 */
@Service
@Transactional(readOnly = true)
class TimelineService(
    private val eventRepository: EventRepository,
    private val personRepository: PersonRepository,
    private val eventService: EventService,
    private val chipService: ChipService,
) {
    /** #44 사람별 피드. 카테고리 필터는 다중 OR, 미지정이면 전체. 소유·active 아니면 404. */
    fun personFeed(userId: Long, personId: Long, categoryChipIds: List<Long>): List<EventResponse> {
        requireOwnedPerson(userId, personId)
        val events = eventRepository.findByPersonId(personId)
            .filter { categoryChipIds.isEmpty() || it.categoryChipId in categoryChipIds }
        return eventService.toResponses(events)
    }

    /** #45 활동 흐름. 만남/연락/추억 레인 × 최근 6개월 유무 매트릭스. 기타·커스텀 카테고리는 제외. */
    fun activityFlow(userId: Long, personId: Long): ActivityFlowResponse {
        requireOwnedPerson(userId, personId)
        val events = eventRepository.findByPersonId(personId)

        // 과거→현재 순 6개월(현재월 포함).
        val currentMonth = YearMonth.from(LocalDate.now())
        val window = (WINDOW_MONTHS - 1 downTo 0).map { currentMonth.minusMonths(it.toLong()) }

        val laneCategoryIds = LANES.associateWith { chipService.commonCategoryId(it.label) }
        val laneCategoryIdSet = laneCategoryIds.values.filterNotNull().toSet()

        val lanes = LANES.map { spec ->
            val categoryId = laneCategoryIds.getValue(spec)
            val monthsWithRecord = events
                .filter { categoryId != null && it.categoryChipId == categoryId }
                .map { YearMonth.from(it.occurredDate) }
                .toSet()
            ActivityFlowLane(
                lane = spec.lane,
                categoryLabel = spec.label,
                present = window.map { it in monthsWithRecord },
            )
        }

        return ActivityFlowResponse(
            months = window.map { it.toString() },
            lanes = lanes,
            hasAnyActivity = events.any { it.categoryChipId in laneCategoryIdSet },
        )
    }

    /** #46 전체 타임라인. 카테고리(OR)·사람(OR) 필터, 축간 AND. 월 그룹, 카드에 연결 사람(대표 우선). */
    fun myTimeline(userId: Long, categoryChipIds: List<Long>, personIds: List<Long>): MyTimelineResponse {
        val events = eventRepository.findByOwnerIdAndDeletedAtIsNullOrderByOccurredDateDescIdDesc(userId)
            .filter { categoryChipIds.isEmpty() || it.categoryChipId in categoryChipIds }
            .filter { personIds.isEmpty() || it.personIds.any { pid -> pid in personIds } }

        val bases = eventService.toResponses(events)
        val personById = personRepository.findAllById(events.flatMap { it.personIds }.distinct())
            .mapNotNull { p -> p.id?.let { it to p } }.toMap()

        // findByOwnerId...OrderBy 가 이미 최신순이라 groupBy 가 삽입 순서(최신 월 먼저)를 보존한다.
        val groups = events.zip(bases)
            .groupBy { (event, _) -> YearMonth.from(event.occurredDate) }
            .map { (ym, pairs) ->
                MyTimelineMonthGroup(
                    year = ym.year,
                    month = ym.monthValue,
                    label = "${ym.year}년 ${ym.monthValue}월",
                    cards = pairs.map { (event, base) -> MyTimelineCard.from(base, representativePersons(event, personById)) },
                )
            }
        return MyTimelineResponse(groups)
    }

    /**
     * 카드의 연결 사람들을 대표 우선으로 정렬(#46, PRD 05 §4): 즐겨찾기 → 가나다.
     * 소프트삭제된 인물도 findAllById 로 잡혀 이름이 유지된다(과거 참조 보존). 한글 완성형은 코드포인트 순이 곧 가나다.
     */
    private fun representativePersons(event: Event, personById: Map<Long, Person>): List<TimelinePersonRef> = event.personIds.mapNotNull { personById[it] }
        .sortedWith(compareByDescending<Person> { it.favorite }.thenBy { it.name })
        .map { TimelinePersonRef(requireNotNull(it.id), it.name, it.profileImageUrl, it.favorite) }

    private fun requireOwnedPerson(userId: Long, personId: Long) {
        personRepository.findByIdAndOwnerIdAndDeletedAtIsNull(personId, userId) ?: throw BusinessException(ErrorCode.NOT_FOUND)
    }

    private data class LaneSpec(val lane: ActivityLane, val label: String)

    companion object {
        private const val WINDOW_MONTHS = 6

        // 레인 → 공통 카테고리 라벨 앵커. '추억' 레인은 카테고리 '기념일'에 대응(PRD 03 §4).
        private val LANES = listOf(
            LaneSpec(ActivityLane.MEETING, "만남"),
            LaneSpec(ActivityLane.CONTACT, "연락"),
            LaneSpec(ActivityLane.MEMORY, "기념일"),
        )
    }
}
