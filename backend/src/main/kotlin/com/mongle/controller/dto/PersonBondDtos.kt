package com.mongle.controller.dto

import io.swagger.v3.oas.annotations.media.Schema

/**
 * 사이 잇기 요청. 방향이 없으므로 두 id 의 순서는 의미가 없다 —
 * 프론트는 끌어다 놓은 순서 그대로 보내면 되고, 정규화는 저장 단계(PersonBond)가 한다.
 */
@Schema(description = "사이 잇기 요청. 두 id 의 순서는 의미가 없다(방향 없는 관계).")
data class PersonBondRequest(
    @field:Schema(description = "이을 인물 id 하나.", example = "9")
    val personAId: Long,
    @field:Schema(description = "이을 인물 id 다른 하나.", example = "3")
    val personBId: Long,
)

/** 사이 잇기 결과. 정규화된 뒤의 값이라 요청과 순서가 다를 수 있다. */
@Schema(description = "만들어진 사이. personAId < personBId 로 눕혀진 값이라 요청과 순서가 다를 수 있다.")
data class PersonBondResponse(
    @field:Schema(description = "사이 id.", example = "5")
    val id: Long,
    @field:Schema(description = "한쪽 인물 id(작은 쪽).", example = "3")
    val personAId: Long,
    @field:Schema(description = "다른 쪽 인물 id(큰 쪽).", example = "9")
    val personBId: Long,
)
