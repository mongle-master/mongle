package com.mongle.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint

/**
 * 공통 칩을 특정 사용자가 자기 목록에서만 내린 기록.
 *
 * 공통 칩은 모두가 공유하므로 소프트삭제하면 타인에게도 사라진다 —
 * 그래서 "숨김"은 원본을 건드리지 않고 (사용자, 공통칩) 쌍으로만 남긴다.
 * 목록 병합 시 이 쌍에 걸린 공통 칩을 그 사용자에게서만 제외한다.
 */
@Entity
@Table(
    name = "chip_hide",
    uniqueConstraints = [UniqueConstraint(name = "uq_chip_hide", columnNames = ["owner_id", "chip_id"])],
)
class ChipHide(
    @Column(name = "owner_id", nullable = false, updatable = false)
    val ownerId: Long,
    @Column(name = "chip_id", nullable = false, updatable = false)
    val chipId: Long,
) : BaseEntity() {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null
}
