package com.mongle.service

import com.mongle.common.ValidationLimits
import com.mongle.common.Validators
import com.mongle.common.exception.BusinessException
import com.mongle.common.exception.ErrorCode
import com.mongle.controller.dto.EventRequest
import com.mongle.controller.dto.EventResponse
import com.mongle.domain.ChipType
import com.mongle.domain.Event
import com.mongle.domain.EventEmotion
import com.mongle.domain.EventPerson
import com.mongle.domain.Person
import com.mongle.repository.ChipRepository
import com.mongle.repository.EventEmotionRepository
import com.mongle.repository.EventPersonRepository
import com.mongle.repository.EventRepository
import com.mongle.repository.PersonRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
@Transactional(readOnly = true)
class EventService(
    private val eventRepository: EventRepository,
    private val personRepository: PersonRepository,
    private val chipRepository: ChipRepository,
    private val chipService: ChipService,
    private val eventPersonRepository: EventPersonRepository,
    private val eventEmotionRepository: EventEmotionRepository,
) {
    @Transactional
    fun create(userId: Long, request: EventRequest): EventResponse {
        // occurredDate·categoryChipId 는 applyRequest 에서 확정되므로 생성자 값은 즉시 덮인다.
        val event = Event(ownerId = userId, occurredDate = LocalDate.now(), categoryChipId = 0L)
        val persons = applyRequest(userId, event, request)
        val saved = eventRepository.save(event)
        syncPersons(requireNotNull(saved.id), request.personIds)
        syncEmotions(requireNotNull(saved.id), request.emotionChipIds)
        applyDerived(persons, saved)
        return toResponse(saved)
    }

    /** 단건 상세(#38) — 수정 모드 재사용용. 내 소유·active 만, 아니면 NOT_FOUND. */
    fun detail(userId: Long, eventId: Long): EventResponse = toResponse(loadOwned(userId, eventId))

    /**
     * 전체 수정(#38) — 등록과 같은 입력·검증을 재사용한다. 칩·인물·사진은 보낸 값으로 교체.
     * 파생 일관성 한계(의도적): 수정으로 만남 날짜가 과거로 바뀌어도 인물 마지막 만남은 되돌리지 않는다
     * (updateLastMetIfNewer 는 전진만). #30 파생 계산이 조회 시 이벤트 기준으로 재계산하므로 여기서 역계산하지 않는다.
     */
    @Transactional
    fun update(userId: Long, eventId: Long, request: EventRequest): EventResponse {
        val event = loadOwned(userId, eventId)
        val persons = applyRequest(userId, event, request)
        syncPersons(eventId, request.personIds)
        syncEmotions(eventId, request.emotionChipIds)
        applyDerived(persons, event)
        return toResponse(event)
    }

    private fun loadOwned(userId: Long, eventId: Long): Event = eventRepository.findByIdAndOwnerIdAndDeletedAtIsNull(eventId, userId) ?: throw BusinessException(ErrorCode.NOT_FOUND)

    /**
     * 등록·수정이 공유하는 입력 반영. 검증(인물·칩·사진·글자수·날짜)을 모두 통과한 뒤에만 필드를 세팅한다.
     * 사진은 엔티티에 바로 교체하고, 인물·감정은 조인 엔티티라 저장(id 확보) 후 호출자가 syncPersons/syncEmotions 로 교체한다.
     * 반환값(연결 인물)은 파생 갱신(applyDerived)에서 재사용한다 — 같은 트랜잭션의 관리 엔티티라 dirty checking 으로 반영.
     */
    private fun applyRequest(userId: Long, event: Event, request: EventRequest): List<Person> {
        // 인물: 요청 id 중 내 소유·active 만 로드해 검증(없는·타인·삭제 id 는 여기서 걸러져 NOT_FOUND).
        val persons = personRepository.findByIdInAndOwnerIdAndDeletedAtIsNull(request.personIds.distinct(), userId)
        EventValidator.validatePersons(request.personIds, persons.mapNotNull { it.id }.toSet())

        val categoryChipId = request.categoryChipId ?: chipService.defaultCategoryId(userId)
        EventValidator.validateCategory(categoryChipId, visibleChipIds(userId, ChipType.CATEGORY))
        EventValidator.validateWeather(request.weatherChipId, visibleChipIds(userId, ChipType.WEATHER))
        EventValidator.validateEmotions(request.emotionChipIds, visibleChipIds(userId, ChipType.EMOTION))
        EventValidator.validatePhotos(request.photoUrls)

        val date = request.occurredDate ?: LocalDate.now()
        EventValidator.validateDate(date)

        val title = request.title?.trim()?.ifBlank { null }?.also { Validators.maxLength(it, ValidationLimits.EVENT_TITLE_MAX) }
        val why = request.why?.trim()?.ifBlank { null }?.also { Validators.maxLength(it, ValidationLimits.WHY_MAX) }
        val what = request.what?.trim()?.ifBlank { null }?.also { Validators.maxLength(it, ValidationLimits.WHAT_MAX) }

        event.occurredDate = date
        event.occurredTime = request.occurredTime
        event.categoryChipId = requireNotNull(categoryChipId) // validateCategory 가 non-null 을 보장
        event.weatherChipId = request.weatherChipId
        event.title = title
        event.why = why
        event.what = what
        event.replacePhotos(request.photoUrls.map { it.trim() }.filter { it.isNotBlank() })
        return persons
    }

    /** 연결 인물 조인 행 전체 교체 — 하드삭제 후 순서대로 재삽입(displayOrder 0 = 대표 인물). */
    private fun syncPersons(eventId: Long, personIds: List<Long>) {
        eventPersonRepository.deleteByEventId(eventId)
        personIds.forEachIndexed { order, personId ->
            eventPersonRepository.save(EventPerson(eventId = eventId, personId = personId, displayOrder = order))
        }
    }

    /** 감정 칩 조인 행 전체 교체 — 하드삭제 후 선택 순서대로 재삽입. */
    private fun syncEmotions(eventId: Long, chipIds: List<Long>) {
        eventEmotionRepository.deleteByEventId(eventId)
        chipIds.forEachIndexed { order, chipId ->
            eventEmotionRepository.save(EventEmotion(eventId = eventId, chipId = chipId, displayOrder = order))
        }
    }

    /**
     * 저장 후 파생 갱신(§7): 카테고리가 만남이면 각 연결 인물의 마지막 만남을 이 기록 날짜로 전진(더 최근일 때만).
     * 함께한 기록 수·만난 횟수는 조회 시 계산(#30)이라 여기서 저장하지 않는다.
     */
    private fun applyDerived(persons: List<Person>, event: Event) {
        if (event.categoryChipId == chipService.meetingCategoryId()) {
            persons.forEach { it.updateLastMetIfNewer(event.occurredDate) }
        }
    }

    private fun visibleChipIds(userId: Long, type: ChipType): Set<Long> = chipService.visibleChips(userId, type).mapNotNull { it.id }.toSet()

    private fun toResponse(event: Event): EventResponse = toResponses(listOf(event)).first()

    /**
     * 칩 라벨·인물 이름은 id 로 해석한다 — rename 이 자동 반영되고, 소프트삭제된 칩·인물도
     * findAllById 로 잡혀 값이 유지된다(과거 참조 보존, 00-infra). 컬렉션 접근이 트랜잭션 안에서 끝나도록 서비스에서 변환한다.
     * 타임라인 피드(#44 #46)가 여러 기록을 한 번에 카드로 변환할 때 이 진입점을 재사용한다 —
     * 자동 제목(#37)·라벨 해석 규칙이 한곳에 있어야 화면 간 drift 가 안 난다. id 조회는 배치(findAllById)로 묶는다.
     */
    fun toResponses(events: List<Event>): List<EventResponse> {
        if (events.isEmpty()) return emptyList()
        val personIdsByEvent = personIdsByEvent(events)
        val emotionIdsByEvent = emotionIdsByEvent(events)
        val chipIds = events.flatMap { collectChipIds(it, emotionIdsByEvent[it.id].orEmpty()) }.distinct()
        val personIds = personIdsByEvent.values.flatten().distinct()
        val chipLabels = chipRepository.findAllById(chipIds).mapNotNull { chip -> chip.id?.let { it to chip.label } }.toMap()
        val personNames = personRepository.findAllById(personIds).mapNotNull { person -> person.id?.let { it to person.name } }.toMap()
        return events.map {
            EventResponse.from(it, personIdsByEvent[it.id].orEmpty(), emotionIdsByEvent[it.id].orEmpty(), chipLabels, personNames)
        }
    }

    /** 여러 기록의 연결 인물 id 를 한 번에 로드(순서 보존, 첫 번째가 대표) — 홈·타임라인이 재사용해 N+1 을 막는다. */
    fun personIdsByEvent(events: List<Event>): Map<Long, List<Long>> {
        val eventIds = events.mapNotNull { it.id }
        if (eventIds.isEmpty()) return emptyMap()
        return eventPersonRepository.findByEventIdInOrderByEventIdAscDisplayOrderAsc(eventIds)
            .groupBy { it.eventId }
            .mapValues { (_, rows) -> rows.map { it.personId } }
    }

    private fun emotionIdsByEvent(events: List<Event>): Map<Long, List<Long>> {
        val eventIds = events.mapNotNull { it.id }
        if (eventIds.isEmpty()) return emptyMap()
        return eventEmotionRepository.findByEventIdInOrderByEventIdAscDisplayOrderAsc(eventIds)
            .groupBy { it.eventId }
            .mapValues { (_, rows) -> rows.map { it.chipId } }
    }

    private fun collectChipIds(event: Event, emotionChipIds: List<Long>): List<Long> = buildList {
        add(event.categoryChipId)
        event.weatherChipId?.let { add(it) }
        addAll(emotionChipIds)
    }
}
