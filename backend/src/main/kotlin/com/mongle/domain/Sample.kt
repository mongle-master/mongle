package com.mongle.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

/**
 * 템플릿 예시용 도메인 엔티티.
 * 실제 프로젝트에서는 이 파일을 지우고 도메인에 맞게 새로 작성한다.
 */
@Entity
@Table(name = "sample")
class Sample(
    @Column(nullable = false)
    var name: String,
) : BaseEntity() {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    fun rename(name: String) {
        this.name = name
    }
}
