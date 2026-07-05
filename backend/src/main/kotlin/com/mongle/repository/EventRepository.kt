package com.mongle.repository

import com.mongle.domain.Event
import org.springframework.data.jpa.repository.JpaRepository

/**
 * 조회는 항상 소유자·active(deletedAt IS NULL)로 거른다(SoftDeletableEntity 규약).
 * 인물별 집계는 personIds element-collection 을 JOIN 하는 JPQL 로 연다(파생·홈·타임라인이 확장).
 */
interface EventRepository : JpaRepository<Event, Long> {
    fun findByIdAndOwnerIdAndDeletedAtIsNull(id: Long, ownerId: Long): Event?

    // 전역 타임라인(#44~46): 최신 날짜 먼저, 같은 날은 최근 저장 먼저.
    fun findByOwnerIdAndDeletedAtIsNullOrderByOccurredDateDescIdDesc(ownerId: Long): List<Event>
}
