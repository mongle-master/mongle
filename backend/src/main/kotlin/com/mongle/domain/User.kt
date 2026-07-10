package com.mongle.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.util.UUID

/**
 * 소유 컨텍스트의 주체. 모든 소유 엔티티(칩·인물·기록)의 ownerId 가 이 id 를 가리킨다.
 *
 * 비밀번호가 없는 데모 인증이다. 브라우저가 만든 UUID로 식별하며 username은 표시 이름이다.
 * 테이블명이 `users` 인 건 user 가 다수 DB 의 예약어라서다.
 */
@Entity
@Table(name = "users")
class User(
    @Id
    val id: UUID,
    @Column(nullable = false, updatable = false)
    val username: String,
) : BaseEntity() {
    @Column(name = "demo_seeded", nullable = false)
    var demoSeeded: Boolean = false
        private set

    fun markDemoSeeded() {
        demoSeeded = true
    }
}
