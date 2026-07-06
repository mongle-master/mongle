package com.mongle.controller

import com.mongle.common.context.AuthUser
import com.mongle.common.context.UserPrincipal
import com.mongle.common.exception.ErrorResponse
import com.mongle.controller.dto.EventRequest
import com.mongle.controller.dto.EventResponse
import com.mongle.service.EventService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@Tag(
    name = "기록",
    description = "기록(이벤트) 등록·조회·수정 — 함께한 사람·카테고리·감정·날씨·사진으로 하나의 기록을 남긴다.",
)
@RestController
@RequestMapping("/api/v1/events")
class EventController(
    private val eventService: EventService,
) {
    @Operation(
        summary = "기록 등록",
        description = "함께한 사람(최소 1명)으로 기록을 남긴다. 카테고리·날짜는 미지정 시 만남·오늘로 채운다. 칩·인물은 내 것이면서 보이는 것만 연결할 수 있다.",
    )
    @ApiResponses(
        ApiResponse(responseCode = "400", description = "인물 미선택(REQUIRED_FIELD)·글자수 초과(LENGTH_EXCEEDED)·감정 선택 개수 초과(SELECTION_LIMIT)·미래 날짜(FUTURE_DATE)·카테고리 누락(CATEGORY_REQUIRED).", content = [Content(schema = Schema(implementation = ErrorResponse::class))]),
        ApiResponse(responseCode = "401", description = "토큰 없음·무효(UNAUTHORIZED).", content = [Content(schema = Schema(implementation = ErrorResponse::class))]),
        ApiResponse(responseCode = "404", description = "내 것이 아니거나 보이지 않는 인물·칩 연결(NOT_FOUND).", content = [Content(schema = Schema(implementation = ErrorResponse::class))]),
    )
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        @AuthUser user: UserPrincipal,
        @RequestBody request: EventRequest,
    ): EventResponse = eventService.create(user.id, request)

    @Operation(
        summary = "기록 상세 조회",
        description = "기록 하나를 조회한다. 제목 미입력 기록은 조회 시점에 '대표 인물 · 카테고리' 자동 제목을 계산해 준다.",
    )
    @ApiResponses(
        ApiResponse(responseCode = "401", description = "토큰 없음·무효(UNAUTHORIZED).", content = [Content(schema = Schema(implementation = ErrorResponse::class))]),
        ApiResponse(responseCode = "404", description = "내 기록이 아님·존재하지 않음(NOT_FOUND).", content = [Content(schema = Schema(implementation = ErrorResponse::class))]),
    )
    @GetMapping("/{id}")
    fun detail(
        @AuthUser user: UserPrincipal,
        @Parameter(description = "기록 id.", example = "21") @PathVariable id: Long,
    ): EventResponse = eventService.detail(user.id, id)

    @Operation(
        summary = "기록 수정",
        description = "기록을 통째로 교체한다(등록과 같은 검증). 연결 인물·칩·사진도 요청 값으로 재구성한다.",
    )
    @ApiResponses(
        ApiResponse(responseCode = "400", description = "인물 미선택(REQUIRED_FIELD)·글자수 초과(LENGTH_EXCEEDED)·감정 선택 개수 초과(SELECTION_LIMIT)·미래 날짜(FUTURE_DATE)·카테고리 누락(CATEGORY_REQUIRED).", content = [Content(schema = Schema(implementation = ErrorResponse::class))]),
        ApiResponse(responseCode = "401", description = "토큰 없음·무효(UNAUTHORIZED).", content = [Content(schema = Schema(implementation = ErrorResponse::class))]),
        ApiResponse(responseCode = "404", description = "내 기록이 아님·존재하지 않음, 또는 내 것이 아닌 인물·칩 연결(NOT_FOUND).", content = [Content(schema = Schema(implementation = ErrorResponse::class))]),
    )
    @PutMapping("/{id}")
    fun update(
        @AuthUser user: UserPrincipal,
        @Parameter(description = "기록 id.", example = "21") @PathVariable id: Long,
        @RequestBody request: EventRequest,
    ): EventResponse = eventService.update(user.id, id, request)
}
