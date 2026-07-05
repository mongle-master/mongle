package com.mongle.controller

import com.mongle.common.context.CurrentUserId
import com.mongle.controller.dto.ActivityFlowResponse
import com.mongle.controller.dto.EventResponse
import com.mongle.service.TimelineService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

/**
 * 타임라인 조회(#44~#46). 사람별 피드·활동 흐름은 인물 하위 경로(/api/persons/{id}/...),
 * 전체 타임라인은 전역(/api/timeline). 필터 파라미터는 미지정 시 전체(빈 리스트).
 */
@RestController
class TimelineController(
    private val timelineService: TimelineService,
) {
    @GetMapping("/api/persons/{personId}/timeline")
    fun personFeed(
        @CurrentUserId userId: Long,
        @PathVariable personId: Long,
        @RequestParam(required = false) categoryChipIds: List<Long>?,
    ): List<EventResponse> = timelineService.personFeed(userId, personId, categoryChipIds.orEmpty())

    @GetMapping("/api/persons/{personId}/activity-flow")
    fun activityFlow(
        @CurrentUserId userId: Long,
        @PathVariable personId: Long,
    ): ActivityFlowResponse = timelineService.activityFlow(userId, personId)
}
