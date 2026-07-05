package com.mongle.controller

import com.mongle.common.context.CurrentUserId
import com.mongle.controller.dto.ChipCreateRequest
import com.mongle.controller.dto.ChipRenameRequest
import com.mongle.controller.dto.ChipResponse
import com.mongle.domain.ChipType
import com.mongle.service.ChipService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
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
    ): List<ChipResponse> {
        val defaultId = if (type == ChipType.CATEGORY) chipService.defaultCategoryId(userId) else null
        return chipService.visibleChips(userId, type).map { ChipResponse.from(it, defaultId) }
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        @CurrentUserId userId: Long,
        @RequestBody request: ChipCreateRequest,
    ): ChipResponse = ChipResponse.from(chipService.create(userId, request.type, request.label))

    @PatchMapping("/{id}")
    fun rename(
        @CurrentUserId userId: Long,
        @PathVariable id: Long,
        @RequestBody request: ChipRenameRequest,
    ): ChipResponse = ChipResponse.from(chipService.rename(userId, id, request.label))

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(
        @CurrentUserId userId: Long,
        @PathVariable id: Long,
    ) = chipService.delete(userId, id)
}
