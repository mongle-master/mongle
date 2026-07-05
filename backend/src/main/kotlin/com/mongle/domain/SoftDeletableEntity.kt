package com.mongle.domain

import jakarta.persistence.Column
import jakarta.persistence.MappedSuperclass
import java.time.LocalDateTime

/**
 * 소프트삭제(deletedAt) 공통 상위 엔티티.
 *
 * 조회 필터 규약: 전역 필터(@SQLRestriction)를 걸지 않는다.
 * 지운 라벨이라도 그 라벨을 이미 참조하는 과거 기록에서는 값이 보여야 하기 때문이다.
 * 따라서 "새로 고를 목록"을 반환하는 repository 쿼리에서만 `deletedAt IS NULL` 로 거른다.
 */
@MappedSuperclass
abstract class SoftDeletableEntity : BaseEntity() {
    @Column
    var deletedAt: LocalDateTime? = null
        protected set

    val deleted: Boolean
        get() = deletedAt != null

    fun softDelete() {
        if (deletedAt == null) {
            deletedAt = LocalDateTime.now()
        }
    }
}
