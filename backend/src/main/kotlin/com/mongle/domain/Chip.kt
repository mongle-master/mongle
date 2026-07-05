package com.mongle.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.Table

/**
 * 칩(감정·날씨·카테고리·관계태그 라벨).
 *
 * 소유는 ownerId 로 구분한다: null=공통(모두 공유)·값=개인(그 사용자만). (00-infra 소유 컨텍스트)
 * 기록·인물은 이 id 를 참조하고 label 은 복사 저장하지 않는다 —
 * 이름을 바꾸면 id 그대로라 지난 기록·인물에 저절로 반영된다.
 * 공통 칩의 "개인 숨김"은 여기서 지우지 않고 별도 ChipHide 로 표현한다(타인 영향 차단).
 */
@Entity
@Table(
    name = "chip",
    indexes = [Index(name = "idx_chip_type_owner", columnList = "type, owner_id")],
)
class Chip(
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, updatable = false)
    val type: ChipType,
    // null = 공통, 값 = 개인 소유자. 소유는 생성 후 바뀌지 않는다.
    @Column(name = "owner_id", updatable = false)
    val ownerId: Long?,
    @Column(nullable = false)
    var label: String,
    // 같은 종류·계층 안에서의 표시 순서(오름차순). order 는 SQL 예약어라 display_order.
    @Column(name = "display_order", nullable = false)
    var displayOrder: Int,
) : SoftDeletableEntity() {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    val isCommon: Boolean
        get() = ownerId == null

    fun rename(label: String) {
        this.label = label
    }
}
