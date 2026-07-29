package com.mongle.controller

import com.mongle.common.context.AuthUser
import com.mongle.common.context.UserPrincipal
import com.mongle.common.exception.ErrorResponse
import com.mongle.controller.dto.PersonBondRequest
import com.mongle.controller.dto.PersonBondResponse
import com.mongle.service.PersonBondService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@Tag(
    name = "사이",
    description = "인물↔인물 '사이' — 서로 아는 두 사람을 잇고 끊는다. 조회 전용 엔드포인트는 없다: 관계 지도(GET /api/v1/home/relation-map)의 bonds 로 함께 내려간다.",
)
@RestController
@RequestMapping("/api/v1/person-bonds")
class PersonBondController(
    private val personBondService: PersonBondService,
) {
    @Operation(
        operationId = "createPersonBond",
        summary = "사이 잇기",
        description = "서로 아는 두 인물을 잇는다. 방향이 없어 두 id 의 순서는 의미가 없고, 저장은 작은 id 가 앞에 오도록 눕혀진다. 같은 쌍을 반대 방향으로 다시 보내도 새로 만들지 않는다.",
    )
    @ApiResponses(
        ApiResponse(responseCode = "201", description = "만들어진 사이.", useReturnTypeSchema = true),
        ApiResponse(responseCode = "400", description = "같은 인물끼리 이으려 함(INVALID_INPUT).", content = [Content(schema = Schema(implementation = ErrorResponse::class))]),
        ApiResponse(responseCode = "401", description = "토큰 없음·무효(UNAUTHORIZED).", content = [Content(schema = Schema(implementation = ErrorResponse::class))]),
        ApiResponse(responseCode = "404", description = "둘 중 하나라도 내 인물이 아님·존재하지 않음(NOT_FOUND).", content = [Content(schema = Schema(implementation = ErrorResponse::class))]),
        ApiResponse(responseCode = "409", description = "이미 이어진 사이(DUPLICATE).", content = [Content(schema = Schema(implementation = ErrorResponse::class))]),
    )
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun connect(
        @AuthUser user: UserPrincipal,
        @RequestBody request: PersonBondRequest,
    ): PersonBondResponse = personBondService.connect(user.id, request)

    @Operation(
        operationId = "deletePersonBond",
        summary = "사이 끊기",
        description = "사이를 끊는다. 두 사람의 기록은 지워지지 않으며, 다시 이으면 되돌아온다.",
    )
    @ApiResponses(
        ApiResponse(responseCode = "204", description = "끊음(본문 없음).", content = [Content()]),
        ApiResponse(responseCode = "401", description = "토큰 없음·무효(UNAUTHORIZED).", content = [Content(schema = Schema(implementation = ErrorResponse::class))]),
        ApiResponse(responseCode = "404", description = "내 사이가 아님·존재하지 않음(NOT_FOUND).", content = [Content(schema = Schema(implementation = ErrorResponse::class))]),
    )
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun disconnect(
        @AuthUser user: UserPrincipal,
        @Parameter(description = "사이 id.", example = "5") @PathVariable id: Long,
    ) = personBondService.disconnect(user.id, id)
}
