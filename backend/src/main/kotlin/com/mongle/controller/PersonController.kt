package com.mongle.controller

import com.mongle.common.context.CurrentUserId
import com.mongle.controller.dto.PersonDetailResponse
import com.mongle.controller.dto.PersonRequest
import com.mongle.controller.dto.PersonResponse
import com.mongle.controller.dto.PersonSort
import com.mongle.service.PersonService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/persons")
class PersonController(
    private val personService: PersonService,
) {
    @GetMapping
    fun directory(
        @CurrentUserId userId: Long,
        @RequestParam(defaultValue = "NAME") sort: PersonSort,
        @RequestParam(required = false) query: String?,
    ): List<PersonResponse> = personService.directory(userId, sort, query)

    @GetMapping("/{id}")
    fun detail(
        @CurrentUserId userId: Long,
        @PathVariable id: Long,
    ): PersonDetailResponse = personService.detail(userId, id)

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun register(
        @CurrentUserId userId: Long,
        @RequestBody request: PersonRequest,
    ): PersonResponse = personService.register(userId, request)

    @PutMapping("/{id}")
    fun update(
        @CurrentUserId userId: Long,
        @PathVariable id: Long,
        @RequestBody request: PersonRequest,
    ): PersonResponse = personService.update(userId, id, request)

    @PatchMapping("/{id}/favorite")
    fun toggleFavorite(
        @CurrentUserId userId: Long,
        @PathVariable id: Long,
    ): PersonResponse = personService.toggleFavorite(userId, id)

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(
        @CurrentUserId userId: Long,
        @PathVariable id: Long,
    ) = personService.delete(userId, id)
}
