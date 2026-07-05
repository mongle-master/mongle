package com.mongle.repository

import com.mongle.domain.Chip
import com.mongle.domain.ChipType
import org.springframework.data.jpa.repository.JpaRepository

/**
 * 조회는 "새로 고를 목록"이므로 항상 deletedAt IS NULL 로 거른다(SoftDeletableEntity 규약).
 * 소유 계층은 ownerId 로 분리: IsNull=공통, ownerId=개인.
 */
interface ChipRepository : JpaRepository<Chip, Long> {
    fun findByTypeAndOwnerIdIsNullAndDeletedAtIsNullOrderByDisplayOrderAsc(type: ChipType): List<Chip>

    fun findByTypeAndOwnerIdAndDeletedAtIsNullOrderByDisplayOrderAsc(type: ChipType, ownerId: Long): List<Chip>

    // 시드 멱등성: 공통 라벨이 이미 있으면 스킵.
    fun existsByTypeAndOwnerIdIsNullAndLabel(type: ChipType, label: String): Boolean

    // 중복 검사(생성) — 공통 전체 + 내 개인 active.
    fun existsByTypeAndOwnerIdIsNullAndLabelAndDeletedAtIsNull(type: ChipType, label: String): Boolean

    fun existsByTypeAndOwnerIdAndLabelAndDeletedAtIsNull(type: ChipType, ownerId: Long, label: String): Boolean

    // 중복 검사(이름 변경) — 자기 자신 제외.
    fun existsByTypeAndOwnerIdAndLabelAndDeletedAtIsNullAndIdNot(type: ChipType, ownerId: Long, label: String, id: Long): Boolean

    // 새 개인 칩의 표시 순서 계산용 — 그 종류 개인 칩 중 가장 큰 순서.
    fun findFirstByTypeAndOwnerIdOrderByDisplayOrderDesc(type: ChipType, ownerId: Long): Chip?

    // 종류별 개인 칩 개수(상한 판정) — 소프트삭제 제외.
    fun countByTypeAndOwnerIdAndDeletedAtIsNull(type: ChipType, ownerId: Long): Int
}
