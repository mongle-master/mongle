package com.mongle.common.image

import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.util.UUID

/**
 * 로컬 파일시스템 단건 이미지 저장(로컬 개발·도커). baseDir 아래에 저장하고 urlPath 로 정적 서빙(WebConfig).
 * 배포(prod) 프로필에서는 [SupabaseImageStorage] 가 대신 활성화된다.
 */
@Service
@Profile("!prod")
class LocalImageStorage(
    private val properties: ImageProperties,
    private val validator: ImageValidator,
) : ImageStorage {
    private val root: Path = Paths.get(properties.baseDir).toAbsolutePath().normalize()

    override fun store(file: MultipartFile): StoredImage {
        val ext = validator.validate(file)

        val filename = "${UUID.randomUUID()}.$ext"
        Files.createDirectories(root)
        val target = root.resolve(filename)
        file.inputStream.use { Files.copy(it, target, StandardCopyOption.REPLACE_EXISTING) }

        return StoredImage(filename = filename, url = "${properties.urlPath}/$filename")
    }

    override fun delete(urlOrFilename: String) {
        val filename = urlOrFilename.substringAfterLast('/')
        if (filename.isBlank()) return
        // 경로 조작 방어: root 밖을 가리키면 무시.
        val target = root.resolve(filename).normalize()
        if (!target.startsWith(root)) return
        Files.deleteIfExists(target)
    }
}
