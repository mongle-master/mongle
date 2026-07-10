package com.mongle.common.image

import com.mongle.common.exception.BusinessException
import com.mongle.common.exception.ErrorCode
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.context.annotation.Profile
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClient
import org.springframework.web.client.RestClientException
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

private val log = KotlinLogging.logger {}

/**
 * Supabase Storage 단건 이미지 저장(배포 prod 프로필). Render 무료 디스크가 휘발성이라
 * 재배포에도 이미지가 보존되도록 오브젝트 스토리지에 올린다.
 *
 * Storage REST 를 그대로 호출한다(별도 S3 SDK 의존성 없이 spring-web RestClient 로 충분):
 * - 업로드 POST /storage/v1/object/{bucket}/{name} (원본 바이트 + x-upsert)
 * - 공개 URL  GET  /storage/v1/object/public/{bucket}/{name}  (버킷이 public 이어야 함)
 * - 삭제    DELETE /storage/v1/object/{bucket}/{name}
 */
@Service
@Profile("prod")
class SupabaseImageStorage(
    private val supabase: SupabaseProperties,
    private val validator: ImageValidator,
) : ImageStorage {
    private val restClient: RestClient = RestClient.builder()
        .baseUrl(supabase.url.trimEnd('/'))
        .defaultHeader("Authorization", "Bearer ${supabase.serviceKey}")
        .build()

    override fun store(file: MultipartFile): StoredImage {
        val ext = validator.validate(file)
        val filename = "${UUID.randomUUID()}.$ext"

        try {
            restClient.post()
                .uri("/storage/v1/object/{bucket}/{name}", supabase.bucket, filename)
                // 파일명 UUID 라 충돌은 없지만, 재시도 멱등을 위해 upsert 허용.
                .header("x-upsert", "true")
                .contentType(MediaType.parseMediaType(file.contentType ?: MediaType.APPLICATION_OCTET_STREAM_VALUE))
                .body(file.bytes)
                .retrieve()
                .toBodilessEntity()
        } catch (e: RestClientException) {
            log.error(e) { "Supabase 이미지 업로드 실패: $filename" }
            throw BusinessException(ErrorCode.SAVE_FAILED)
        }

        val publicUrl = "${supabase.url.trimEnd('/')}/storage/v1/object/public/${supabase.bucket}/$filename"
        return StoredImage(filename = filename, url = publicUrl)
    }

    override fun delete(urlOrFilename: String) {
        val filename = urlOrFilename.substringAfterLast('/')
        if (filename.isBlank()) return
        try {
            restClient.delete()
                .uri("/storage/v1/object/{bucket}/{name}", supabase.bucket, filename)
                .retrieve()
                .toBodilessEntity()
        } catch (e: RestClientException) {
            // 로컬 구현과 동일하게 삭제 실패는 조용히 통과(교체·롤백 보조라 치명적이지 않음).
            log.warn(e) { "Supabase 이미지 삭제 실패(무시): $filename" }
        }
    }
}
