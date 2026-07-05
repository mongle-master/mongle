package com.mongle.service

import com.mongle.common.Messages
import com.mongle.common.exception.BusinessException
import com.mongle.common.exception.ErrorCode

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
}
