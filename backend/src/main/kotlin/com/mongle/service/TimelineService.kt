package com.mongle.service

import com.mongle.common.exception.BusinessException
import com.mongle.common.exception.ErrorCode
import com.mongle.controller.dto.EventResponse
import com.mongle.repository.EventRepository
import com.mongle.repository.PersonRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

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
) {
    /** #44 사람별 피드. 카테고리 필터는 다중 OR, 미지정이면 전체. 소유·active 아니면 404. */
    fun personFeed(userId: Long, personId: Long, categoryChipIds: List<Long>): List<EventResponse> {
        requireOwnedPerson(userId, personId)
        val events = eventRepository.findByPersonId(personId)
            .filter { categoryChipIds.isEmpty() || it.categoryChipId in categoryChipIds }
        return eventService.toResponses(events)
    }

    private fun requireOwnedPerson(userId: Long, personId: Long) {
        personRepository.findByIdAndOwnerIdAndDeletedAtIsNull(personId, userId) ?: throw BusinessException(ErrorCode.NOT_FOUND)
    }
}
