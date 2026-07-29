package com.mongle.service

import com.mongle.common.Messages
import com.mongle.common.exception.BusinessException
import com.mongle.common.exception.ErrorCode
import com.mongle.controller.dto.BondEdge
import com.mongle.controller.dto.PersonBondRequest
import com.mongle.controller.dto.PersonBondResponse
import com.mongle.domain.PersonBond
import com.mongle.repository.PersonBondRepository
import com.mongle.repository.PersonRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * 인물↔인물 '사이'. 나↔인물 관계(친밀도·멀어짐)와 다른 축이라 판정 로직을 공유하지 않는다.
 * 방향 없음·중복 방지는 저장 구조(PersonBond 가 쌍을 눕힌다)에 맡기고, 여기서는 소유·자기참조만 본다.
 */
@Service
@Transactional(readOnly = true)
class PersonBondService(
    private val personBondRepository: PersonBondRepository,
    private val personRepository: PersonRepository,
) {
    /**
     * 사이 잇기. 두 인물이 **모두** 내 소유·active 여야 한다.
     * 하나라도 아니면 403 이 아니라 404 로 답한다 — 남의 인물이 존재하는지를 응답으로 알려주지 않기 위함.
     */
    @Transactional
    fun connect(userId: UUID, request: PersonBondRequest): PersonBondResponse {
        // 자기 자신 검사는 눕히기 전에 한다 — min/max 를 거치면 두 값이 같았다는 사실이 순서 판정에 묻힌다.
        if (request.personAId == request.personBId) throw BusinessException(ErrorCode.INVALID_INPUT)

        val requestedIds = listOf(request.personAId, request.personBId)
        val ownedCount = personRepository.findByIdInAndOwnerIdAndDeletedAtIsNull(requestedIds, userId).size
        if (ownedCount != requestedIds.size) throw BusinessException(ErrorCode.NOT_FOUND)

        val bond = PersonBond(
            ownerId = userId,
            firstPersonId = request.personAId,
            secondPersonId = request.personBId,
        )
        if (personBondRepository.existsPair(userId, bond.personAId, bond.personBId)) {
            throw BusinessException(ErrorCode.DUPLICATE, Messages.DUPLICATE_BOND)
        }

        val saved = personBondRepository.save(bond)
        return PersonBondResponse(
            id = requireNotNull(saved.id),
            personAId = saved.personAId,
            personBId = saved.personBId,
        )
    }

    /** 사이 끊기. 내 소유 행만 지운다(하드삭제). 두 사람의 기록은 건드리지 않는다. */
    @Transactional
    fun disconnect(userId: UUID, bondId: Long) {
        val bond = personBondRepository.findByIdAndOwnerId(bondId, userId)
            ?: throw BusinessException(ErrorCode.NOT_FOUND)
        personBondRepository.delete(bond)
    }

    /**
     * 인물 삭제 시 그 인물에게 걸린 사이 정리. PersonService.delete 가 부른다.
     * 관계태그 행과 달리 남기지 않는다 — 사이는 어떤 기록도 참조하지 않아 과거 참조 보존 대상이 아니다.
     */
    @Transactional
    fun deleteByPerson(personId: Long) = personBondRepository.deleteByPersonIdOnEitherEnd(personId)

    /**
     * 관계 지도에 실을 사이. **양쪽 끝이 모두 보이는 노드인 것만** 남긴다 —
     * 관계태그 필터로 한쪽이 빠지면 그릴 수 없는 선이 되기 때문(PRD 01 §5).
     */
    fun bondsAmong(userId: UUID, visiblePersonIds: Set<Long>): List<BondEdge> = personBondRepository.findAllOfOwner(userId)
        .filter { it.personAId in visiblePersonIds && it.personBId in visiblePersonIds }
        .map { BondEdge(id = requireNotNull(it.id), personAId = it.personAId, personBId = it.personBId) }
}
