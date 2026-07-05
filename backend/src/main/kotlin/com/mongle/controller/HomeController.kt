package com.mongle.controller

import com.mongle.common.context.CurrentUserId
import com.mongle.controller.dto.RelationMapResponse
import com.mongle.service.HomeService
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
}
