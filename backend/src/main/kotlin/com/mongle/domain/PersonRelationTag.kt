package com.mongle.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.Table

/**
 * 인물↔관계태그 칩 연결(다대다 조인 엔티티, 컨벤션 §1).
 *
 * 인물은 관계태그 칩을 label 복사 없이 id 로만 참조한다(#22) — 칩 이름을 바꾸면 저절로 반영된다.
 * displayOrder 로 입력 순서를 보존한다. 하드삭제(행 삭제)가 기본: 관계태그 교체는 이 행들을 지우고 다시 넣는다.
 * (인물 소프트삭제 시에는 이 행을 지우지 않는다 — 과거 참조 보존.)
 */
@Entity
@Table(
    name = "person_relation_tag",
    indexes = [Index(name = "idx_person_relation_tag_person", columnList = "person_id")],
)
class PersonRelationTag(
    @Column(name = "person_id", nullable = false, updatable = false)
    val personId: Long,
    @Column(name = "chip_id", nullable = false, updatable = false)
    val chipId: Long,
    @Column(name = "display_order", nullable = false)
    val displayOrder: Int,
) : BaseEntity() {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null
}
