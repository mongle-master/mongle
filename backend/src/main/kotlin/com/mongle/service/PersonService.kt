package com.mongle.service

import com.mongle.common.Messages
import com.mongle.common.ValidationLimits
import com.mongle.common.Validators
import com.mongle.common.exception.BusinessException
import com.mongle.common.exception.ErrorCode
import com.mongle.controller.dto.PersonRequest
import com.mongle.controller.dto.PersonResponse
import com.mongle.domain.ChipType
import com.mongle.domain.Person
import com.mongle.repository.ChipRepository
import com.mongle.repository.PersonRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class PersonService(
    private val personRepository: PersonRepository,
    private val chipService: ChipService,
    private val chipRepository: ChipRepository,
) {
    @Transactional
    fun register(userId: Long, request: PersonRequest): PersonResponse {
        val person = Person(ownerId = userId, name = request.name)
        applyRequest(userId, person, request)
        return toResponse(personRepository.save(person))
    }

    /** 전체 수정(PUT) — 등록과 같은 입력·검증을 재사용한다. 내 소유·active 인물만, 아니면 NOT_FOUND. */
    @Transactional
    fun update(userId: Long, personId: Long, request: PersonRequest): PersonResponse {
        val person = personRepository.findByIdAndOwnerIdAndDeletedAtIsNull(personId, userId)
            ?: throw BusinessException(ErrorCode.NOT_FOUND)
        applyRequest(userId, person, request)
        return toResponse(person)
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
     * 등록·수정이 공유하는 입력 반영. 검증(글자수·날짜·태그·취향)을 모두 통과한 뒤에만 필드를 세팅한다.
     * 관계 태그·취향 목록은 보낸 값으로 전체 교체한다(PUT 시맨틱).
     */
    private fun applyRequest(userId: Long, person: Person, request: PersonRequest) {
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

        val allowedTagIds = chipService.visibleChips(userId, ChipType.RELATION_TAG).mapNotNull { it.id }.toSet()
        PersonValidator.validateRelationTags(request.relationTagChipIds, allowedTagIds)

        val likes = request.likes.map { it.trim() }.filter { it.isNotBlank() }
        val cautions = request.cautions.map { it.trim() }.filter { it.isNotBlank() }
        PersonValidator.validatePreferences(likes)
        PersonValidator.validatePreferences(cautions)

        person.name = name
        person.birthYear = birthday?.year
        person.birthMonth = birthday?.month
        person.birthDay = birthday?.day
        person.firstMetDate = request.firstMetDate
        person.lastMetDate = request.lastMetDate
        person.profileImageUrl = request.profileImageUrl?.trim()?.ifBlank { null }
        person.relationType = relationType
        person.favorite = request.favorite
        person.replaceRelationTags(request.relationTagChipIds)
        person.replaceLikes(likes)
        person.replaceCautions(cautions)
    }

    /**
     * 관계 태그 라벨은 칩에서 해석한다 — id 참조라 이름이 바뀌면 자동 반영되고,
     * 소프트삭제된 칩도 findAllById 로 잡혀 라벨이 유지된다(과거 참조 보존, 00-infra).
     * 컬렉션 접근이 트랜잭션 안에서 일어나도록 응답 변환을 서비스에서 마친다(지연 로딩 안전).
     */
    private fun toResponse(person: Person): PersonResponse {
        val tagLabels = chipRepository.findAllById(person.relationTagChipIds)
            .mapNotNull { chip -> chip.id?.let { it to chip.label } }
            .toMap()
        return PersonResponse.from(person, tagLabels)
    }
}
