package com.mongle.repository

import com.mongle.domain.EventPerson
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.transaction.annotation.Transactional

/**
 * 기록의 연결 인물 행. 순서(displayOrder)로 대표 인물(0)·표시 순서를 보존.
 * 교체는 deleteByEventId 후 재삽입. 인물 삭제 연쇄(#27)는 deleteByEventIdAndPersonId 로 한 연결만 끊고,
 * countByEventId 로 남은 연결이 0이면 기록을 소프트삭제한다. 배치 조회는 findByEventIdIn.
 */
interface EventPersonRepository : JpaRepository<EventPerson, Long> {
    fun findByEventIdOrderByDisplayOrderAsc(eventId: Long): List<EventPerson>

    fun findByEventIdInOrderByEventIdAscDisplayOrderAsc(eventIds: Collection<Long>): List<EventPerson>

    fun countByEventId(eventId: Long): Long

    @Transactional
    fun deleteByEventId(eventId: Long)

    @Transactional
    fun deleteByEventIdAndPersonId(eventId: Long, personId: Long)
}
