package com.mongle.service

import com.mongle.common.Messages
import com.mongle.common.ValidationLimits
import com.mongle.common.Validators
import com.mongle.common.exception.BusinessException
import com.mongle.common.exception.ErrorCode
import com.mongle.controller.dto.PersonDetailResponse
import com.mongle.controller.dto.PersonRequest
import com.mongle.controller.dto.PersonResponse
import com.mongle.controller.dto.PersonSort
import com.mongle.domain.ChipType
import com.mongle.domain.Person
import com.mongle.domain.PersonRelationTag
import com.mongle.repository.ChipRepository
import com.mongle.repository.EventPersonRepository
import com.mongle.repository.EventRepository
import com.mongle.repository.PersonRelationTagRepository
import com.mongle.repository.PersonRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
@Transactional(readOnly = true)
class PersonService(
    private val personRepository: PersonRepository,
    private val chipService: ChipService,
    private val chipRepository: ChipRepository,
    private val personStatsService: PersonStatsService,
    private val eventRepository: EventRepository,
    private val personRelationTagRepository: PersonRelationTagRepository,
    private val eventPersonRepository: EventPersonRepository,
) {
    @Transactional
    fun register(userId: Long, request: PersonRequest): PersonResponse {
        val person = Person(ownerId = userId, name = request.name)
        val relationTagChipIds = applyRequest(userId, person, request)
        val saved = personRepository.save(person)
        syncRelationTags(requireNotNull(saved.id), relationTagChipIds)
        return toResponse(saved)
    }

    /** 전체 수정(PUT) — 등록과 같은 입력·검증을 재사용한다. 내 소유·active 인물만, 아니면 NOT_FOUND. */
    @Transactional
    fun update(userId: Long, personId: Long, request: PersonRequest): PersonResponse {
        val person = personRepository.findByIdAndOwnerIdAndDeletedAtIsNull(personId, userId)
            ?: throw BusinessException(ErrorCode.NOT_FOUND)
        val relationTagChipIds = applyRequest(userId, person, request)
        syncRelationTags(requireNotNull(person.id), relationTagChipIds)
        return toResponse(person)
    }

    /**
     * 디렉토리 목록(#29). 즐겨찾기를 항상 상단 그룹으로 두고 그 안에서 정렬한다:
     * 이름순(대소문자 무시) / 최근 만남순(마지막 만난 날 최신 먼저·없는 사람은 뒤).
     * 검색은 이름·관계 유형 부분 일치(대소문자 무시). 즐겨찾기 상단 조건이 있어 in-memory 로 조합한다.
     * (최근 만남순의 마지막 만난 날은 이후 파생 단계에서 event 반영으로 갱신된다.)
     */
    fun directory(userId: Long, sort: PersonSort, query: String?): List<PersonResponse> {
        val keyword = query?.trim()?.lowercase()?.ifBlank { null }
        val within = when (sort) {
            PersonSort.NAME -> compareBy(String.CASE_INSENSITIVE_ORDER) { p: Person -> p.name }
            PersonSort.RECENT -> Comparator.comparing(Person::lastMetDate, Comparator.nullsLast(Comparator.reverseOrder<LocalDate>()))
        }
        val order = compareByDescending<Person> { it.favorite }.then(within)
        val persons = personRepository.findByOwnerIdAndDeletedAtIsNull(userId)
            .filter { keyword == null || it.matches(keyword) }
            .sortedWith(order)
        // 관계태그·라벨을 한 번에 로드해 인물별 N+1 을 막는다.
        val tagChipIdsByPerson = relationTagChipIdsByPerson(persons)
        val tagLabels = resolveTagLabels(tagChipIdsByPerson.values.flatten())
        return persons.map { PersonResponse.from(it, tagChipIdsByPerson[it.id].orEmpty(), tagLabels) }
    }

    private fun Person.matches(keyword: String): Boolean = name.lowercase().contains(keyword) || relationType?.lowercase()?.contains(keyword) == true

    /** 상세 조회(#25). 기본 정보 + 파생 스탯(#30). 내 소유·active 인물만, 아니면 NOT_FOUND. */
    fun detail(userId: Long, personId: Long): PersonDetailResponse {
        val person = personRepository.findByIdAndOwnerIdAndDeletedAtIsNull(personId, userId)
            ?: throw BusinessException(ErrorCode.NOT_FOUND)
        val stats = personStatsService.statsOf(person)
        val tagChipIds = relationTagChipIdsOf(person)
        return PersonDetailResponse.from(person, stats, tagChipIds, resolveTagLabels(tagChipIds), LocalDate.now())
    }

    /** 즐겨찾기 토글(#28). 내 소유·active 인물만, 아니면 NOT_FOUND. */
    @Transactional
    fun toggleFavorite(userId: Long, personId: Long): PersonResponse {
        val person = personRepository.findByIdAndOwnerIdAndDeletedAtIsNull(personId, userId)
            ?: throw BusinessException(ErrorCode.NOT_FOUND)
        person.toggleFavorite()
        return toResponse(person)
    }

    /**
     * 삭제(#27). 인물을 소프트삭제하고, 연결된 active 기록마다 이 인물을 연결에서 제거한다 —
     * 그 결과 연결 인물이 0명이 되면(마지막 연결이었으면) 그 기록도 소프트삭제한다.
     * 다인 연결 기록은 통삭제하지 않는다(다른 사람 타임라인 보존, 판단 근거는 mustpass 02 §삭제).
     * 이미 소프트삭제된 기록은 findByPersonId 가 걸러 과거 참조를 보존한다.
     */
    @Transactional
    fun delete(userId: Long, personId: Long) {
        val person = personRepository.findByIdAndOwnerIdAndDeletedAtIsNull(personId, userId)
            ?: throw BusinessException(ErrorCode.NOT_FOUND)
        // active 기록에서만 이 인물 연결을 끊는다(소프트삭제된 기록은 findByPersonId 가 걸러 과거 참조 보존).
        // 연결이 0명이 된(마지막 연결이었던) 기록은 소프트삭제. 인물의 관계태그 행은 소프트삭제 시 남긴다(과거 참조 보존).
        eventRepository.findByPersonId(personId).forEach { event ->
            val eventId = requireNotNull(event.id)
            eventPersonRepository.deleteByEventIdAndPersonId(eventId, personId)
            if (eventPersonRepository.countByEventId(eventId) == 0L) event.softDelete()
        }
        person.softDelete()
    }

    /**
     * 등록·수정이 공유하는 입력 반영. 검증(글자수·날짜·태그·취향)을 모두 통과한 뒤에만 필드를 세팅한다.
     * 취향 목록은 엔티티에 바로 교체하고, 관계 태그는 조인 엔티티라 검증된 칩 id 목록만 돌려줘
     * 저장(id 확보) 후 호출자가 syncRelationTags 로 교체한다(PUT 시맨틱).
     */
    private fun applyRequest(userId: Long, person: Person, request: PersonRequest): List<Long> {
        val name = request.name.trim()
        Validators.requireNotBlank(name, Messages.REQUIRED_NAME)
        Validators.maxLength(name, ValidationLimits.NAME_MAX)

        val relationType = request.relationType?.trim()?.ifBlank { null }
        relationType?.let { Validators.maxLength(it, ValidationLimits.RELATION_TYPE_MAX) }

        val birthday = request.birthday
        PersonValidator.validateDates(
            birthYear = birthday?.year,
            birthMonth = birthday?.month,
            birthDay = birthday?.day,
            firstMetDate = request.firstMetDate,
            lastMetDate = request.lastMetDate,
        )

        // 관계태그 id 중복은 첫 등장 기준 1건으로 정규화한다 — 개수 상한도 정규화 이후 개수로 판단.
        val relationTagChipIds = request.relationTagChipIds.distinct()
        val allowedTagIds = chipService.visibleChips(userId, ChipType.RELATION_TAG).mapNotNull { it.id }.toSet()
        PersonValidator.validateRelationTags(relationTagChipIds, allowedTagIds)

        val likes = request.likes.map { it.trim() }.filter { it.isNotBlank() }
        val cautions = request.cautions.map { it.trim() }.filter { it.isNotBlank() }
        PersonValidator.validatePreferences(likes)
        PersonValidator.validatePreferences(cautions)

        // 월·일 없는 생일은 연도까지 무시한다(전부 null) — Birthday.from 이 월·일 기준으로 '생일 없음'을 판정하므로 연도만 남으면 응답에 안 보이는 유령 값이 된다.
        val effectiveBirthday = birthday?.takeIf { it.month != null && it.day != null }

        person.name = name
        person.birthYear = effectiveBirthday?.year
        person.birthMonth = effectiveBirthday?.month
        person.birthDay = effectiveBirthday?.day
        person.firstMetDate = request.firstMetDate
        person.lastMetDate = request.lastMetDate
        person.profileImageUrl = request.profileImageUrl?.trim()?.ifBlank { null }
        person.relationType = relationType
        person.favorite = request.favorite
        person.replaceLikes(likes)
        person.replaceCautions(cautions)
        return relationTagChipIds
    }

    /** 관계 태그 조인 행 전체 교체(수정 시 보낸 값으로 갈아끼움) — 하드삭제 후 순서대로 재삽입. */
    private fun syncRelationTags(personId: Long, chipIds: List<Long>) {
        personRelationTagRepository.deleteByPersonId(personId)
        chipIds.forEachIndexed { order, chipId ->
            personRelationTagRepository.save(PersonRelationTag(personId = personId, chipId = chipId, displayOrder = order))
        }
    }

    private fun relationTagChipIdsOf(person: Person): List<Long> = personRelationTagRepository
        .findByPersonIdOrderByDisplayOrderAsc(requireNotNull(person.id)).map { it.chipId }

    /** 여러 인물의 관계태그 칩 id 를 한 번에 로드(순서 보존) — 목록·홈이 재사용해 N+1 을 막는다. */
    fun relationTagChipIdsByPerson(persons: List<Person>): Map<Long, List<Long>> {
        val personIds = persons.mapNotNull { it.id }
        if (personIds.isEmpty()) return emptyMap()
        return personRelationTagRepository.findByPersonIdInOrderByPersonIdAscDisplayOrderAsc(personIds)
            .groupBy { it.personId }
            .mapValues { (_, rows) -> rows.map { it.chipId } }
    }

    /**
     * 관계 태그 라벨은 칩에서 해석한다 — id 참조라 이름이 바뀌면 자동 반영되고,
     * 소프트삭제된 칩도 findAllById 로 잡혀 라벨이 유지된다(과거 참조 보존, 00-infra).
     */
    private fun toResponse(person: Person): PersonResponse {
        val tagChipIds = relationTagChipIdsOf(person)
        return PersonResponse.from(person, tagChipIds, resolveTagLabels(tagChipIds))
    }

    private fun resolveTagLabels(chipIds: List<Long>): Map<Long, String> = chipRepository.findAllById(chipIds)
        .mapNotNull { chip -> chip.id?.let { it to chip.label } }
        .toMap()
}
