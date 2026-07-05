package com.mongle.repository

import com.mongle.domain.EventEmotion
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.transaction.annotation.Transactional

/**
 * 기록의 감정 칩 연결 행. 순서(displayOrder)는 선택 순서 보존.
 * 교체는 deleteByEventId 후 재삽입. 배치 조회는 findByEventIdIn 으로 N+1 을 막는다.
 */
interface EventEmotionRepository : JpaRepository<EventEmotion, Long> {
    fun findByEventIdInOrderByEventIdAscDisplayOrderAsc(eventIds: Collection<Long>): List<EventEmotion>

    @Transactional
    fun deleteByEventId(eventId: Long)
}
