package com.mongle.controller

import com.mongle.common.context.CurrentUserId
import com.mongle.controller.dto.RelationMapResponse
import com.mongle.controller.dto.ThrowbackResponse
import com.mongle.service.HomeService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/home")
class HomeController(
    private val homeService: HomeService,
) {
    // relationTagChipIds 다중(?relationTagChipIds=1&relationTagChipIds=2) = 합집합(OR) 필터(#42). 없으면 전체.
    @GetMapping("/relation-map")
    fun relationMap(
        @CurrentUserId userId: Long,
        @RequestParam(required = false) relationTagChipIds: List<Long>?,
    ): RelationMapResponse = homeService.relationMap(userId, relationTagChipIds ?: emptyList())

    // 1년 전 오늘 기록이 없으면 204 — 프론트가 플로팅을 띄우지 않는다(#43).
    @GetMapping("/throwback")
    fun throwback(
        @CurrentUserId userId: Long,
    ): ResponseEntity<ThrowbackResponse> = homeService.throwback(userId)?.let { ResponseEntity.ok(it) } ?: ResponseEntity.noContent().build()
}
