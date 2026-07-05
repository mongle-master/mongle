package com.mongle.controller

import com.mongle.common.context.CurrentUserId
import com.mongle.controller.dto.EventRequest
import com.mongle.controller.dto.EventResponse
import com.mongle.service.EventService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/events")
class EventController(
    private val eventService: EventService,
) {
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        @CurrentUserId userId: Long,
        @RequestBody request: EventRequest,
    ): EventResponse = eventService.create(userId, request)

    @GetMapping("/{id}")
    fun detail(
        @CurrentUserId userId: Long,
        @PathVariable id: Long,
    ): EventResponse = eventService.detail(userId, id)

    @PutMapping("/{id}")
    fun update(
        @CurrentUserId userId: Long,
        @PathVariable id: Long,
        @RequestBody request: EventRequest,
    ): EventResponse = eventService.update(userId, id, request)
}
