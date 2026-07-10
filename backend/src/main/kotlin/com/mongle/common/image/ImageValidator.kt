package com.mongle.common.image

import com.mongle.common.exception.BusinessException
import com.mongle.common.exception.ErrorCode
import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile

/**
 * 업로드 이미지 검증 공통화(§12.6). 저장 매체(로컬·Supabase)와 무관하게 같은 규칙을 강제하려고
 * 저장 구현체가 아니라 이 컴포넌트에 검증을 모은다.
 *
 * 서블릿 멀티파트 상한 초과는 프레임워크가 먼저 걸러
 * MaxUploadSizeExceededException → IMAGE_TOO_LARGE 로 응답된다(GlobalExceptionHandler).
 */
@Component
class ImageValidator(
    private val properties: ImageProperties,
) {
    private val allowed: Set<String> = properties.allowedExtensions.map { it.lowercase() }.toSet()

    /** 검증을 통과하면 소문자 확장자를 돌려준다(파일명 생성에 사용). */
    fun validate(file: MultipartFile): String {
        if (file.isEmpty) throw BusinessException(ErrorCode.INVALID_INPUT)

        val ext = file.originalFilename
            ?.substringAfterLast('.', "")
            ?.lowercase()
            .orEmpty()
        if (ext.isBlank() || ext !in allowed) {
            throw BusinessException(ErrorCode.UNSUPPORTED_IMAGE_TYPE)
        }
        if (file.size > properties.maxBytes.toBytes()) {
            throw BusinessException(ErrorCode.IMAGE_TOO_LARGE)
        }
        return ext
    }
}
