package com.mongle.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint
import java.util.UUID

/**
 * 인물↔인물 '사이'(다대다 조인 엔티티, 컨벤션 §1).
 *
 * 방향 없는 개념을 **저장 구조로** 강제한다 — 생성자에서 한 쌍을 `personAId < personBId` 로 눕히므로
 * 어느 쪽에서 끌어다 놓든 같은 한 행이 되고, 유니크 제약이 곧 중복 방지가 된다.
 * 그래서 이 엔티티만 컬럼을 생성자 파라미터가 아닌 본문 프로퍼티로 둔다(눕히지 않은 값이 애초에 만들어질 수 없게).
 *
 * 하드삭제가 기본: 사이는 어떤 기록도 참조하지 않아 과거 참조 보존 대상이 아니다
 * (관계태그 행을 인물 소프트삭제 시 남기는 것과 다르다 — PersonRelationTag 주석 참고).
 */
@Entity
@Table(
    name = "person_bond",
    uniqueConstraints = [
        UniqueConstraint(name = "uk_person_bond_pair", columnNames = ["owner_id", "person_a_id", "person_b_id"]),
    ],
    indexes = [
        Index(name = "idx_person_bond_owner", columnList = "owner_id"),
        Index(name = "idx_person_bond_person_a", columnList = "person_a_id"),
        Index(name = "idx_person_bond_person_b", columnList = "person_b_id"),
    ],
)
class PersonBond(
    ownerId: UUID,
    firstPersonId: Long,
    secondPersonId: Long,
) : BaseEntity() {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    @Column(name = "owner_id", nullable = false, updatable = false)
    val ownerId: UUID = ownerId

    @Column(name = "person_a_id", nullable = false, updatable = false)
    val personAId: Long = minOf(firstPersonId, secondPersonId)

    @Column(name = "person_b_id", nullable = false, updatable = false)
    val personBId: Long = maxOf(firstPersonId, secondPersonId)
}
