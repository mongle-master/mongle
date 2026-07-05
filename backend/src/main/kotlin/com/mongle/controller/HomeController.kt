package com.mongle.controller

import com.mongle.common.context.CurrentUserId
import com.mongle.controller.dto.RelationMapResponse
import com.mongle.service.HomeService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/home")
class HomeController(
    private val homeService: HomeService,
) {
    @GetMapping("/relation-map")
    fun relationMap(
        @CurrentUserId userId: Long,
    ): RelationMapResponse = homeService.relationMap(userId)
}
