package com.mongle.controller

import com.mongle.common.context.AuthUser
import com.mongle.common.context.UserPrincipal
import com.mongle.service.DemoDataSeeder
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@Tag(name = "시드", description = "현재 사용자의 데모 데이터를 준비한다.")
@RestController
@RequestMapping("/api/v1/seed")
class SeedController(
    private val demoDataSeeder: DemoDataSeeder,
) {
    @Operation(summary = "현재 사용자 데모 데이터 시드")
    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun seed(@AuthUser user: UserPrincipal) {
        demoDataSeeder.seed(user.id)
    }
}
