package com.mongle.controller

import com.mongle.controller.dto.SampleCreateRequest
import com.mongle.controller.dto.SampleResponse
import com.mongle.service.SampleService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/samples")
class SampleController(
    private val sampleService: SampleService,
) {
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        @Valid @RequestBody request: SampleCreateRequest,
    ): SampleResponse = SampleResponse.from(sampleService.create(request.name))

    @GetMapping("/{id}")
    fun get(
        @PathVariable id: Long,
    ): SampleResponse = SampleResponse.from(sampleService.get(id))

    @GetMapping
    fun getAll(): List<SampleResponse> = sampleService.getAll().map(SampleResponse::from)
}
