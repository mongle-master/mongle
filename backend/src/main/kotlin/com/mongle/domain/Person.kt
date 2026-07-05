package com.mongle.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.Table
import java.time.LocalDate

/**
 * 인물(관계를 맺은 사람).
 *
 * 소유는 ownerId(데모 사용자)에 귀속되고 소프트삭제를 상속한다 — 지워도 과거 참조(기록)에는 값이 남는 규약(SoftDeletableEntity).
 * 관계 태그(RELATION_TAG 칩)는 label 을 복사하지 않고 id 만 참조한다(#22) — 칩 이름을 바꾸면 저절로 반영된다.
 */
@Entity
@Table(
    name = "person",
    indexes = [Index(name = "idx_person_owner", columnList = "owner_id")],
)
class Person(
    @Column(name = "owner_id", nullable = false, updatable = false)
    val ownerId: Long,
    @Column(nullable = false)
    var name: String,
    // 생일 연도-선택: 월·일은 함께 있거나 함께 없고(생일 자체가 선택), 연도만 따로 생략 가능(연도 없이 월 일만).
    @Column(name = "birth_year")
    var birthYear: Int? = null,
    @Column(name = "birth_month")
    var birthMonth: Int? = null,
    @Column(name = "birth_day")
    var birthDay: Int? = null,
    @Column(name = "first_met_date")
    var firstMetDate: LocalDate? = null,
    @Column(name = "last_met_date")
    var lastMetDate: LocalDate? = null,
    // 미리 업로드된 프로필 사진 경로 1장(업로드는 POST /api/images).
    @Column(name = "profile_image_url")
    var profileImageUrl: String? = null,
    // 관계 유형: 칩이 아닌 한 줄 텍스트(관계 태그와 다른 개념). 한 사람당 하나.
    @Column(name = "relation_type")
    var relationType: String? = null,
    @Column(nullable = false)
    var favorite: Boolean = false,
) : SoftDeletableEntity() {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    /**
     * 기록(event)이 더 최근 만남을 반영하는 진입점(파생 단계 #30). 더 최근일 때만 앞당긴다.
     * 여기서 열어두어 이후 event 연동이 이 필드를 막지 않게 한다.
     */
    fun updateLastMetIfNewer(date: LocalDate) {
        if (lastMetDate == null || date.isAfter(lastMetDate)) {
            lastMetDate = date
        }
    }
}
