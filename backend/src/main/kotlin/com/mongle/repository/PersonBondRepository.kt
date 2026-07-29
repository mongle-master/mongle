package com.mongle.repository

import com.mongle.domain.PersonBond
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * 인물↔인물 '사이' 행. 저장 시 쌍이 눕혀져 있어(PersonBond) 조회·중복 판정 모두 정규 순서만 다루면 된다.
 *
 * 관계 지도는 소유자 단위로 한 번에 읽어 in-memory 로 거른다 — 노드를 거르는 기준(관계태그 필터)과
 * 같은 기준으로 걸러야 한쪽 끝이 없는 선이 남지 않기 때문.
 * personAId·personBId 는 파생 쿼리 이름으로 쓰면 `person.aId` 로 읽힐 여지가 있어 JPQL 로 못박는다.
 */
interface PersonBondRepository : JpaRepository<PersonBond, Long> {
    @Query("select b from PersonBond b where b.ownerId = :ownerId order by b.personAId asc, b.personBId asc")
    fun findAllOfOwner(
        @Param("ownerId") ownerId: UUID,
    ): List<PersonBond>

    @Query("select count(b) > 0 from PersonBond b where b.ownerId = :ownerId and b.personAId = :personAId and b.personBId = :personBId")
    fun existsPair(
        @Param("ownerId") ownerId: UUID,
        @Param("personAId") personAId: Long,
        @Param("personBId") personBId: Long,
    ): Boolean

    fun findByIdAndOwnerId(id: Long, ownerId: UUID): PersonBond?

    // 인물 삭제 정리용 — 그 인물이 어느 쪽 끝이든 지운다(쌍이 눕혀져 있어 한쪽 컬럼만 보면 놓친다).
    @Transactional
    @Modifying
    @Query("delete from PersonBond b where b.personAId = :personId or b.personBId = :personId")
    fun deleteByPersonIdOnEitherEnd(
        @Param("personId") personId: Long,
    )
}
