package com.mongle.controller

import com.mongle.common.context.AuthUser
import com.mongle.common.context.UserPrincipal
import com.mongle.common.exception.ErrorResponse
import com.mongle.controller.dto.RelationMapResponse
import com.mongle.controller.dto.ThrowbackResponse
import com.mongle.service.HomeService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@Tag(
    name = "홈",
    description = "홈 대시보드 — 관계 지도와 '1년 전 오늘' 회고.",
)
@RestController
@RequestMapping("/api/v1/home")
class HomeController(
    private val homeService: HomeService,
) {
    // relationTagChipIds 다중(?relationTagChipIds=1&relationTagChipIds=2) = 합집합(OR) 필터(#42). 없으면 전체.
    @Operation(
        operationId = "getRelationMap",
        summary = "관계 지도 조회",
        description = "중심 '나' 노드와 인물 노드·연결선으로 관계 지도를 그린다. 관계태그 칩으로 인물을 걸러낼 수 있다(여러 개면 합집합). 멀어진 관계는 edge 의 distant 로 표시된다.",
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "관계 지도.", useReturnTypeSchema = true),
        ApiResponse(responseCode = "401", description = "토큰 없음·무효(UNAUTHORIZED).", content = [Content(schema = Schema(implementation = ErrorResponse::class))]),
    )
    @GetMapping("/relation-map")
    fun relationMap(
        @AuthUser user: UserPrincipal,
        @Parameter(description = "관계태그 칩 id 필터. 여러 개면 합집합(OR). 없으면 전체.", example = "[11, 12]")
        @RequestParam(required = false) relationTagChipIds: List<Long>?,
    ): RelationMapResponse = homeService.relationMap(user.id, relationTagChipIds ?: emptyList())

    // 1년 전 오늘 기록이 없으면 204 — 프론트가 플로팅을 띄우지 않는다(#43).
    @Operation(
        operationId = "getThrowback",
        summary = "1년 전 오늘 회고",
        description = "오늘 날짜 기준 정확히 1년 전 기록이 있으면 회고 카드 1건을 반환하고, 없으면 본문 없이 204 를 반환한다(프론트가 플로팅을 띄우지 않음).",
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "회고 카드 1건.", content = [Content(schema = Schema(implementation = ThrowbackResponse::class))]),
        ApiResponse(responseCode = "204", description = "1년 전 오늘 기록 없음(본문 없음).", content = [Content()]),
        ApiResponse(responseCode = "401", description = "토큰 없음·무효(UNAUTHORIZED).", content = [Content(schema = Schema(implementation = ErrorResponse::class))]),
    )
    @GetMapping("/throwback")
    fun throwback(
        @AuthUser user: UserPrincipal,
    ): ResponseEntity<ThrowbackResponse> = homeService.throwback(user.id)?.let { ResponseEntity.ok(it) } ?: ResponseEntity.noContent().build()
}
