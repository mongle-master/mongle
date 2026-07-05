package com.mongle.controller.dto

import com.mongle.domain.Sample
import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

data class SampleCreateRequest(
    @field:NotBlank(message = "name은 비어 있을 수 없습니다.")
    val name: String,
)

data class SampleResponse(
    val id: Long,
    val name: String,
    val createdAt: LocalDateTime?,
) {
    companion object {
        fun from(sample: Sample): SampleResponse = SampleResponse(
            id = requireNotNull(sample.id) { "저장되지 않은 Sample은 응답으로 변환할 수 없습니다." },
            name = sample.name,
            createdAt = sample.createdAt,
        )
    }
}
