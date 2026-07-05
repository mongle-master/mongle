package com.mongle.common.image

import com.mongle.common.exception.BusinessException
import com.mongle.common.exception.ErrorCode
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.util.UUID

/**
 * 저장 결과. url 은 클라이언트가 바로 참조·표시할 수 있는 정적 서빙 경로.
 */
data class StoredImage(
    val filename: String,
    val url: String,
)

/**
 * 로컬 파일시스템 단건 이미지 저장.
 *
 * 단건만 책임진다 — 용도별 개수(프로필 1·기록 5, §12.6)는 각 도메인이 강제한다.
 * 타입·크기 검증은 여기서 하되(§12.6), 서블릿 멀티파트 상한 초과는 프레임워크가 먼저 걸러
 * MaxUploadSizeExceededException → IMAGE_TOO_LARGE 로 응답된다(GlobalExceptionHandler).
 */
@Service
class ImageStorageService(
    private val properties: ImageProperties,
) {
    private val root: Path = Paths.get(properties.baseDir).toAbsolutePath().normalize()
    private val allowed: Set<String> = properties.allowedExtensions.map { it.lowercase() }.toSet()

    fun store(file: MultipartFile): StoredImage {
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

        val filename = "${UUID.randomUUID()}.$ext"
        Files.createDirectories(root)
        val target = root.resolve(filename)
        file.inputStream.use { Files.copy(it, target, StandardCopyOption.REPLACE_EXISTING) }

        return StoredImage(filename = filename, url = "${properties.urlPath}/$filename")
    }

    /** 저장된 이미지 삭제(교체·롤백용). url 또는 filename 을 받는다. 없으면 조용히 통과. */
    fun delete(urlOrFilename: String) {
        val filename = urlOrFilename.substringAfterLast('/')
        if (filename.isBlank()) return
        // 경로 조작 방어: root 밖을 가리키면 무시.
        val target = root.resolve(filename).normalize()
        if (!target.startsWith(root)) return
        Files.deleteIfExists(target)
    }
}
