package com.mongle.controller.dto

import com.mongle.domain.Chip
import com.mongle.domain.ChipType

/**
 * 라벨의 빈값·글자수·중복 검증은 서비스 계층 Validators 로 미룬다(REQUIRED_FIELD·LENGTH_EXCEEDED·DUPLICATE 코드가 필요).
 * DTO @Size 로 걸면 @Valid 실패가 INVALID_INPUT 으로 뭉뚱그려지기 때문.
 */
data class ChipCreateRequest(
    val type: ChipType,
    val label: String,
)

data class ChipRenameRequest(
    val label: String,
)

data class ChipResponse(
    val id: Long,
    val type: ChipType,
    val label: String,
    // 개인 칩 여부(공통=false). 클라이언트가 이름변경·삭제 가능 여부를 판단한다.
    val personal: Boolean,
    val order: Int,
) {
    companion object {
        fun from(chip: Chip): ChipResponse = ChipResponse(
            id = requireNotNull(chip.id) { "저장되지 않은 Chip은 응답으로 변환할 수 없습니다." },
            type = chip.type,
            label = chip.label,
            personal = !chip.isCommon,
            order = chip.displayOrder,
        )
    }
}
