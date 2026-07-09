package com.mongle.domain

import jakarta.persistence.CollectionTable
import jakarta.persistence.Column
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.JoinColumn
import jakarta.persistence.OrderColumn
import jakarta.persistence.Table
import java.time.LocalDate
import java.time.LocalTime

/**
 * 기록(사람과 함께한 상황).
 *
 * 소유는 ownerId(데모 사용자)에 귀속되고 소프트삭제를 상속한다.
 * 칩(카테고리·날씨·감정)·인물은 label/이름을 복사하지 않고 id 만 참조한다 —
 * 이름을 바꾸면 지난 기록에 저절로 반영된다(§12.2). 제목도 미입력이면 저장하지 않고 조회 시 계산한다(#37).
 */
@Entity
@Table(
    name = "event",
    indexes = [Index(name = "idx_event_owner_date", columnList = "owner_id, occurred_date")],
)
class Event(
    @Column(name = "owner_id", nullable = false, updatable = false)
    val ownerId: Long,
    // 언제: 날짜 필수 + 시간 선택(넣은 경우에만 표시). 미지정 시 오늘 기본값은 서비스가 채운다(#39).
    @Column(name = "occurred_date", nullable = false)
    var occurredDate: LocalDate,
    @Column(name = "occurred_time")
    var occurredTime: LocalTime? = null,
    // 카테고리(필수 1)·날씨(선택 0~1): 칩 id 참조. 라벨은 칩에서 해석.
    @Column(name = "category_chip_id", nullable = false)
    var categoryChipId: Long,
    @Column(name = "weather_chip_id")
    var weatherChipId: Long? = null,
    // 사용자가 명시 입력한 제목만 저장. null 이면 조회 시 자동 제목(#37).
    @Column(name = "title")
    var title: String? = null,
    @Column(name = "memo")
    var memo: String? = null,
) : SoftDeletableEntity() {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    // 연결 인물·감정 칩은 EventPerson·EventEmotion 조인 엔티티로 연결한다(컨벤션 §1) — 이 엔티티는 id 만 보유.
    // 인물별 집계는 EventPerson 을 JOIN 하는 쿼리(EventRepository)로 연다.

    // 사진: 미리 업로드된 url 참조, 첨부 순서 보존, ≤5.
    @ElementCollection
    @CollectionTable(name = "event_photo", joinColumns = [JoinColumn(name = "event_id")])
    @OrderColumn(name = "photo_order")
    @Column(name = "url")
    val photoUrls: MutableList<String> = mutableListOf()

    /** 사진은 수정 시 보낸 값으로 전체 교체한다(PUT 시맨틱). 인물·감정 교체는 조인 엔티티 repository 가 담당. */
    fun replacePhotos(urls: List<String>) {
        photoUrls.clear()
        photoUrls.addAll(urls)
    }
}
