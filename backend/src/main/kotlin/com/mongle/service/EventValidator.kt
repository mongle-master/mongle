package com.mongle.service

import com.mongle.common.Messages
import com.mongle.common.ValidationLimits
import com.mongle.common.Validators
import com.mongle.common.exception.BusinessException
import com.mongle.common.exception.ErrorCode
import java.time.LocalDate

/**
 * 기록 입력의 순수 검증(DB 조회 없음). 등록(#36)·수정(#38)이 공유한다.
 *
 * 허용 집합(내 인물·보이는 칩)은 서비스가 DB 로 만들어 넘긴다 —
 * 여기 없는 id 는 존재하지 않거나·타인·다른 종류이므로 NOT_FOUND 로 본다(인물 관계태그 검증과 동일 규약).
 */
object EventValidator {
    /** 연결 인물(#33): 최소 1명, 그리고 내 소유·active 인물(allowedIds)만. */
    fun validatePersons(personIds: List<Long>, allowedIds: Set<Long>) {
        if (personIds.isEmpty()) {
            throw BusinessException(ErrorCode.REQUIRED_FIELD, Messages.REQUIRED_PERSON)
        }
        if (personIds.any { it !in allowedIds }) throw BusinessException(ErrorCode.NOT_FOUND)
    }

    /** 감정(#34): 다중 ≤5, 그리고 보이는 EMOTION 칩(allowedIds)만. */
    fun validateEmotions(chipIds: List<Long>, allowedIds: Set<Long>) {
        Validators.maxSelection(chipIds.size, ValidationLimits.EMOTION_PER_EVENT_MAX)
        if (chipIds.any { it !in allowedIds }) throw BusinessException(ErrorCode.NOT_FOUND)
    }

    /** 날씨(#34): 선택 0~1개. 지정 시 보이는 WEATHER 칩만. */
    fun validateWeather(chipId: Long?, allowedIds: Set<Long>) {
        if (chipId != null && chipId !in allowedIds) throw BusinessException(ErrorCode.NOT_FOUND)
    }

    /** 카테고리(#34): 필수 1개, 보이는 CATEGORY 칩만. 미지정 시 기본 카테고리는 서비스가 채워 넘긴다. */
    fun validateCategory(chipId: Long?, allowedIds: Set<Long>) {
        if (chipId == null) throw BusinessException(ErrorCode.CATEGORY_REQUIRED)
        if (chipId !in allowedIds) throw BusinessException(ErrorCode.NOT_FOUND)
    }

    /** 사진(#35): 최대 5장. url 유효성·업로드는 이미지 도메인 소관이라 여기선 개수만 본다. */
    fun validatePhotos(urls: List<String>) {
        Validators.maxSelection(urls.size, ValidationLimits.EVENT_PHOTO_MAX)
    }

    /** 날짜(#39): 미래 불가·과거 허용. 미지정 시 오늘 기본값은 서비스가 채운 뒤 넘긴다(시간은 날짜와 독립이라 검사 안 함). */
    fun validateDate(date: LocalDate, today: LocalDate = LocalDate.now()) {
        Validators.notFuture(date, today)
    }
}
