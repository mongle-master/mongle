package com.mongle.controller.dto

import io.swagger.v3.oas.annotations.media.Schema

/**
 * 다른 도메인을 조회 응답에 요약 참조할 때의 공용 조각(컨벤션 §2 `{도메인}Ref`).
 * id 로 참조하되 표시값(라벨·이름)을 함께 실어 클라이언트가 재조회 없이 바로 그린다(수정 모드 재사용).
 * 라벨·이름은 소프트삭제된 칩·인물도 유지된다(과거 참조 보존, 00-infra).
 */
@Schema(description = "칩 요약 참조(id + 라벨). 소프트삭제된 칩도 라벨은 유지된다.")
data class ChipRef(
    @field:Schema(description = "칩 id.", example = "3")
    val id: Long,
    @field:Schema(description = "칩 라벨.", example = "만남")
    val label: String,
    @field:Schema(description = "칩 표시 색상(hex).", example = "#0EA5E9")
    val color: String? = null,
)

data class ChipDisplay(
    val label: String,
    val color: String?,
)

@Schema(description = "인물 요약 참조(id + 이름). 소프트삭제된 인물도 이름은 유지된다.")
data class PersonRef(
    @field:Schema(description = "인물 id.", example = "7")
    val id: Long,
    @field:Schema(description = "인물 이름.", example = "김하늘")
    val name: String,
)
