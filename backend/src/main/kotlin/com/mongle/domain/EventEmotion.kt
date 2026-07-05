package com.mongle.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.Table

/**
 * 기록↔감정 칩 연결(다대다 조인 엔티티, 컨벤션 §1). 다중 ≤5.
 *
 * 기록은 감정 칩을 label 복사 없이 id 로만 참조한다(§12.2). displayOrder 로 선택 순서를 보존한다.
 * 하드삭제(행 삭제)가 기본: 감정 교체는 이 행들을 지우고 다시 넣는다.
 */
@Entity
@Table(
    name = "event_emotion",
    indexes = [Index(name = "idx_event_emotion_event", columnList = "event_id")],
)
class EventEmotion(
    @Column(name = "event_id", nullable = false, updatable = false)
    val eventId: Long,
    @Column(name = "chip_id", nullable = false, updatable = false)
    val chipId: Long,
    @Column(name = "display_order", nullable = false)
    val displayOrder: Int,
) : BaseEntity() {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null
}
