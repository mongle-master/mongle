package com.mongle.controller

import com.mongle.common.context.CurrentUserId
import com.mongle.common.exception.ErrorResponse
import com.mongle.controller.dto.ActivityFlowResponse
import com.mongle.controller.dto.EventResponse
import com.mongle.controller.dto.TimelineResponse
import com.mongle.service.TimelineService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

/**
 * 타임라인 조회(#44~#46). 사람별 피드·활동 흐름은 인물 하위 경로(/api/v1/persons/{id}/...),
 * 전체 타임라인은 전역(/api/v1/timeline). 필터 파라미터는 미지정 시 전체(빈 리스트).
 */
@Tag(
    name = "타임라인",
    description = "사람별 피드·활동 흐름과 나의 통합 연대기(전체 타임라인). 필터는 미지정 시 전체.",
)
@RestController
class TimelineController(
    private val timelineService: TimelineService,
) {
    @Operation(
        summary = "사람별 기록 피드",
        description = "특정 인물과 함께한 기록을 최신순으로 반환한다. 카테고리 칩으로 걸러낼 수 있다(여러 개면 합집합).",
    )
    @ApiResponses(
        ApiResponse(responseCode = "401", description = "토큰 없음·무효(UNAUTHORIZED).", content = [Content(schema = Schema(implementation = ErrorResponse::class))]),
        ApiResponse(responseCode = "404", description = "내 인물이 아님·존재하지 않음(NOT_FOUND).", content = [Content(schema = Schema(implementation = ErrorResponse::class))]),
    )
    @GetMapping("/api/v1/persons/{personId}/timeline")
    fun personFeed(
        @CurrentUserId userId: Long,
        @Parameter(description = "인물 id.", example = "7") @PathVariable personId: Long,
        @Parameter(description = "카테고리 칩 id 필터. 여러 개면 합집합(OR). 없으면 전체.", example = "[3, 4]")
        @RequestParam(required = false) categoryChipIds: List<Long>?,
    ): List<EventResponse> = timelineService.personFeed(userId, personId, categoryChipIds.orEmpty())

    @Operation(
        summary = "사람별 활동 흐름",
        description = "특정 인물과의 활동을 레인(만남/연락/추억) × 월 매트릭스로 집계한다. 값은 유무만 담고 횟수·강도는 담지 않는다(관계 점수화 금지).",
    )
    @ApiResponses(
        ApiResponse(responseCode = "401", description = "토큰 없음·무효(UNAUTHORIZED).", content = [Content(schema = Schema(implementation = ErrorResponse::class))]),
        ApiResponse(responseCode = "404", description = "내 인물이 아님·존재하지 않음(NOT_FOUND).", content = [Content(schema = Schema(implementation = ErrorResponse::class))]),
    )
    @GetMapping("/api/v1/persons/{personId}/activity-flow")
    fun activityFlow(
        @CurrentUserId userId: Long,
        @Parameter(description = "인물 id.", example = "7") @PathVariable personId: Long,
    ): ActivityFlowResponse = timelineService.activityFlow(userId, personId)

    @Operation(
        summary = "나의 통합 연대기(전체 타임라인)",
        description = "내 모든 기록을 월 단위로 묶어 최신→과거 순으로 반환한다. 카테고리·인물로 걸러낼 수 있다(각 축 안 합집합, 축 간 교집합). 카드마다 연결된 사람들을 아바타까지 실어 준다.",
    )
    @ApiResponses(
        ApiResponse(responseCode = "401", description = "토큰 없음·무효(UNAUTHORIZED).", content = [Content(schema = Schema(implementation = ErrorResponse::class))]),
    )
    @GetMapping("/api/v1/timeline")
    fun myTimeline(
        @CurrentUserId userId: Long,
        @Parameter(description = "카테고리 칩 id 필터. 여러 개면 합집합(OR). 없으면 전체.", example = "[3, 4]")
        @RequestParam(required = false) categoryChipIds: List<Long>?,
        @Parameter(description = "인물 id 필터. 여러 개면 합집합(OR). 없으면 전체.", example = "[7, 9]")
        @RequestParam(required = false) personIds: List<Long>?,
    ): TimelineResponse = timelineService.myTimeline(userId, categoryChipIds.orEmpty(), personIds.orEmpty())
}
