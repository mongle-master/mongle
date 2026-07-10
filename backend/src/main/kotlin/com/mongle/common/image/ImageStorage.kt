package com.mongle.common.image

import io.swagger.v3.oas.annotations.media.Schema
import org.springframework.web.multipart.MultipartFile

/**
 * 저장 결과. url 은 클라이언트가 바로 참조·표시할 수 있는 경로/URL.
 * - local 프로필: 정적 서빙 경로(`/images/{파일}`)
 * - prod 프로필: Supabase Storage 공개 URL(절대 URL)
 * 두 경우 모두 `delete` 는 마지막 경로 세그먼트에서 파일명을 얻는다.
 */
@Schema(description = "이미지 저장 결과. url 을 도메인(프로필·기록)이 저장·연결한다.")
data class StoredImage(
    @field:Schema(description = "저장된 파일명(UUID.확장자).", example = "a1b2c3d4.jpg")
    val filename: String,
    @field:Schema(description = "이미지 참조 URL. 프로필·기록의 이미지 필드에 그대로 넣는다.", example = "/images/a1b2c3d4.jpg")
    val url: String,
)

/**
 * 단건 이미지 저장 백엔드. 저장 매체(로컬 FS·오브젝트 스토리지)를 프로필로 갈아끼운다.
 *
 * 단건만 책임진다 — 용도별 개수(프로필 1·기록 5, §12.6)는 각 도메인이 강제한다.
 * 타입·크기 검증(§12.6)은 구현체가 [ImageValidator] 로 공통 수행한다.
 */
interface ImageStorage {
    fun store(file: MultipartFile): StoredImage

    /** 저장된 이미지 삭제(교체·롤백용). url 또는 filename 을 받는다. 없으면 조용히 통과. */
    fun delete(urlOrFilename: String)
}
