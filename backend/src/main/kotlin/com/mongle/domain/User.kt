package com.mongle.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint

/**
 * 소유 컨텍스트의 주체. 모든 소유 엔티티(칩·인물·기록)의 ownerId 가 이 id 를 가리킨다.
 *
 * 데모 로그인이라 비밀번호가 없다 — 브라우저 UUID를 username으로 저장하며 발급 시 없으면 만든다(AuthService).
 * 테이블명이 `users` 인 건 user 가 다수 DB 의 예약어라서다.
 */
@Entity
@Table(
    name = "users",
    uniqueConstraints = [UniqueConstraint(name = "uk_user_username", columnNames = ["username"])],
)
class User(
    @Column(nullable = false, updatable = false)
    val username: String,
) : BaseEntity() {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null
}
