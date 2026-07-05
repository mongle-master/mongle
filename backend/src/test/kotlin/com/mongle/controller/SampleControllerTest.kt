package com.mongle.controller

import com.mongle.domain.Sample
import com.mongle.service.SampleService
import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

@WebMvcTest(SampleController::class)
class SampleControllerTest(
    @Autowired private val mockMvc: MockMvc,
) {
    @MockkBean
    private lateinit var sampleService: SampleService

    @Test
    fun `POST samples는 201과 생성된 리소스를 반환한다`() {
        every { sampleService.create("hello") } returns Sample(name = "hello").apply { id = 1L }

        mockMvc.post("/api/samples") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"name":"hello"}"""
        }.andExpect {
            status { isCreated() }
            jsonPath("$.id") { value(1) }
            jsonPath("$.name") { value("hello") }
        }
    }

    @Test
    fun `POST samples는 name이 비면 400을 반환한다`() {
        mockMvc.post("/api/samples") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"name":""}"""
        }.andExpect {
            status { isBadRequest() }
        }
    }

    @Test
    fun `GET samples는 목록을 반환한다`() {
        every { sampleService.getAll() } returns listOf(Sample(name = "a").apply { id = 1L })

        mockMvc.get("/api/samples").andExpect {
            status { isOk() }
            jsonPath("$[0].name") { value("a") }
        }
    }
}
