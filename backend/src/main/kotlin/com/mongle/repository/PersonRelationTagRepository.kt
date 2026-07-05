package com.mongle.repository

import com.mongle.domain.PersonRelationTag
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.transaction.annotation.Transactional

/**
 * 인물의 관계태그 연결 행. 순서(displayOrder)는 입력 순서 보존.
 * 교체는 deleteByPersonId 후 재삽입(하드삭제 기본). 배치 조회는 findByPersonIdIn 으로 N+1 을 막는다.
 */
interface PersonRelationTagRepository : JpaRepository<PersonRelationTag, Long> {
    fun findByPersonIdOrderByDisplayOrderAsc(personId: Long): List<PersonRelationTag>

    fun findByPersonIdInOrderByPersonIdAscDisplayOrderAsc(personIds: Collection<Long>): List<PersonRelationTag>

    @Transactional
    fun deleteByPersonId(personId: Long)
}
