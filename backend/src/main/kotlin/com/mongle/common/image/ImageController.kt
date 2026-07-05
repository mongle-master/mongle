package com.mongle.common.image

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

/**
 * 공통 단건 이미지 업로드. 반환한 url 을 도메인(프로필·기록)이 저장·연결한다.
 */
@RestController
@RequestMapping("/api/v1/images")
class ImageController(
    private val imageStorageService: ImageStorageService,
) {
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun upload(
        @RequestParam("file") file: MultipartFile,
    ): StoredImage = imageStorageService.store(file)
}
