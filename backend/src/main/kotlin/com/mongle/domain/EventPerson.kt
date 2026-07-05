package com.mongle.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.Table

/**
 * 기록↔연결 인물(다대다 조인 엔티티, 컨벤션 §1).
 *
 * 기록은 인물을 이름 복사 없이 id 로만 참조한다(§12.2). displayOrder 로 순서를 보존하며,
 * displayOrder 0 = 대표 인물(자동 제목 #37 의 {대표 이름}).
 * 하드삭제(행 삭제)가 기본: 연결 인물 교체·인물 삭제 연쇄(#27)는 이 행을 지운다.
 */
@Entity
@Table(
    name = "event_person",
    indexes = [
        Index(name = "idx_event_person_event", columnList = "event_id"),
        Index(name = "idx_event_person_person", columnList = "person_id"),
    ],
)
class EventPerson(
    @Column(name = "event_id", nullable = false, updatable = false)
    val eventId: Long,
    @Column(name = "person_id", nullable = false, updatable = false)
    val personId: Long,
    @Column(name = "display_order", nullable = false)
    val displayOrder: Int,
) : BaseEntity() {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null
}
