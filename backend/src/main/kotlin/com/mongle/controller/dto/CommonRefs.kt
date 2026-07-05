package com.mongle.controller.dto

/**
 * 다른 도메인을 조회 응답에 요약 참조할 때의 공용 조각(컨벤션 §2 `{도메인}Ref`).
 * id 로 참조하되 표시값(라벨·이름)을 함께 실어 클라이언트가 재조회 없이 바로 그린다(수정 모드 재사용).
 * 라벨·이름은 소프트삭제된 칩·인물도 유지된다(과거 참조 보존, 00-infra).
 */
data class ChipRef(
    val id: Long,
    val label: String,
)

data class PersonRef(
    val id: Long,
    val name: String,
)
