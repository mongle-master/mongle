package com.mongle.service

import com.mongle.common.ValidationLimits
import com.mongle.common.Validators
import com.mongle.controller.dto.EventRequest
import com.mongle.controller.dto.EventResponse
import com.mongle.domain.ChipType
import com.mongle.domain.Event
import com.mongle.domain.Person
import com.mongle.repository.ChipRepository
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
) {
    @Transactional
    fun create(userId: Long, request: EventRequest): EventResponse {
        // occurredDate·categoryChipId 는 applyRequest 에서 확정되므로 생성자 값은 즉시 덮인다.
        val event = Event(ownerId = userId, occurredDate = LocalDate.now(), categoryChipId = 0L)
        val persons = applyRequest(userId, event, request)
        val saved = eventRepository.save(event)
        applyDerived(persons, saved)
        return toResponse(saved)
    }

    /**
     * 등록·수정이 공유하는 입력 반영. 검증(인물·칩·사진·글자수·날짜)을 모두 통과한 뒤에만 필드를 세팅한다.
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

        val title = request.title?.trim()?.ifBlank { null }?.also { Validators.maxLength(it, ValidationLimits.EVENT_TITLE_MAX) }
        val why = request.why?.trim()?.ifBlank { null }?.also { Validators.maxLength(it, ValidationLimits.WHY_MAX) }
        val what = request.what?.trim()?.ifBlank { null }?.also { Validators.maxLength(it, ValidationLimits.WHAT_MAX) }

        event.occurredDate = request.occurredDate ?: LocalDate.now()
        event.occurredTime = request.occurredTime
        event.categoryChipId = requireNotNull(categoryChipId) // validateCategory 가 non-null 을 보장
        event.weatherChipId = request.weatherChipId
        event.title = title
        event.why = why
        event.what = what
        event.replacePersons(request.personIds)
        event.replaceEmotions(request.emotionChipIds)
        event.replacePhotos(request.photoUrls.map { it.trim() }.filter { it.isNotBlank() })
        return persons
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

    /**
     * 칩 라벨·인물 이름은 id 로 해석한다 — rename 이 자동 반영되고, 소프트삭제된 칩·인물도
     * findAllById 로 잡혀 값이 유지된다(과거 참조 보존, 00-infra). 컬렉션 접근이 트랜잭션 안에서 끝나도록 서비스에서 변환한다.
     */
    private fun toResponse(event: Event): EventResponse {
        val chipIds = buildList {
            add(event.categoryChipId)
            event.weatherChipId?.let { add(it) }
            addAll(event.emotionChipIds)
        }
        val chipLabels = chipRepository.findAllById(chipIds).mapNotNull { chip -> chip.id?.let { it to chip.label } }.toMap()
        val personNames = personRepository.findAllById(event.personIds).mapNotNull { person -> person.id?.let { it to person.name } }.toMap()
        return EventResponse.from(event, chipLabels, personNames)
    }
}
