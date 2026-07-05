package com.mongle.repository

import com.mongle.domain.Person
import org.springframework.data.jpa.repository.JpaRepository

/**
 * 조회는 항상 소유자·active(deletedAt IS NULL)로 거른다(SoftDeletableEntity 규약).
 * 정렬·검색은 서비스 계층에서 조합한다(즐겨찾기 상단 그룹 등 조건이 있어 in-memory 로 구성).
 */
interface PersonRepository : JpaRepository<Person, Long> {
    fun findByOwnerIdAndDeletedAtIsNull(ownerId: Long): List<Person>

    fun findByIdAndOwnerIdAndDeletedAtIsNull(id: Long, ownerId: Long): Person?

    // 기록 연결 인물 검증·파생 갱신용 — 요청 id 중 내 소유·active 인 것만 한 번에 로드(#33 #36).
    fun findByIdInAndOwnerIdAndDeletedAtIsNull(ids: Collection<Long>, ownerId: Long): List<Person>
}
