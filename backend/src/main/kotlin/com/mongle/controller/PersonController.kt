package com.mongle.controller

import com.mongle.common.context.CurrentUserId
import com.mongle.controller.dto.PersonRequest
import com.mongle.controller.dto.PersonResponse
import com.mongle.service.PersonService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/persons")
class PersonController(
    private val personService: PersonService,
) {
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun register(
        @CurrentUserId userId: Long,
        @RequestBody request: PersonRequest,
    ): PersonResponse = personService.register(userId, request)
}
