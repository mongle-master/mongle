package com.mongle.controller

import com.mongle.common.context.CurrentUserId
import com.mongle.controller.dto.ChipResponse
import com.mongle.domain.ChipType
import com.mongle.service.ChipService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/chips")
class ChipController(
    private val chipService: ChipService,
) {
    @GetMapping
    fun list(
        @CurrentUserId userId: Long,
        @RequestParam type: ChipType,
    ): List<ChipResponse> = chipService.visibleChips(userId, type).map(ChipResponse::from)
}
