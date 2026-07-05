package com.mongle.service

import com.mongle.common.ValidationLimits
import com.mongle.common.Validators
import com.mongle.common.exception.BusinessException
import com.mongle.common.exception.ErrorCode
import java.time.LocalDate

/**
 * 인물 입력의 순수 검증(DB 조회 없음). 등록(#24)·수정(#26)이 공유한다.
 *
 * 공통 규칙은 Validators 를 재사용하고, 여기서는 인물 고유 조합만 조율한다:
 * 생일 연도-선택(월·일 쌍·연도 미래), 처음/마지막 만난 날 관계(#31).
 * 관계 태그·취향처럼 DB(허용 칩)나 목록 규칙이 필요한 검증은 별도 메서드로 추가한다(#22 #23).
 */
object PersonValidator {
    /**
     * 처음 만난 날 ≤ 오늘, 마지막 만난 날 = 처음 만난 날 이후·오늘 이하, 생일은 연도가 있으면 미래 불가.
     * (처음 만난 날이 없으면 순서 검사는 건너뛴다 — Validators.dateOrder 가 둘 다 있을 때만 본다.)
     */
    fun validateDates(
        birthYear: Int?,
        birthMonth: Int?,
        birthDay: Int?,
        firstMetDate: LocalDate?,
        lastMetDate: LocalDate?,
        today: LocalDate = LocalDate.now(),
    ) {
        validateBirthday(birthYear, birthMonth, birthDay, today)
        firstMetDate?.let { Validators.notFuture(it, today) }
        lastMetDate?.let {
            Validators.notFuture(it, today)
            Validators.dateOrder(firstMetDate, it)
        }
    }

    /**
     * 관계 태그(#22): 인물당 최대 10개, 그리고 실제로 고를 수 있는 RELATION_TAG 칩(allowedIds)만.
     * allowedIds 는 서비스가 ChipService.visibleChips(RELATION_TAG) 로 만들어 넘긴다 —
     * 존재하지 않거나 다른 종류·타인 칩이면 여기 없어 NOT_FOUND.
     */
    fun validateRelationTags(chipIds: List<Long>, allowedIds: Set<Long>) {
        Validators.maxSelection(chipIds.size, ValidationLimits.RELATION_TAG_PER_PERSON_MAX)
        if (chipIds.any { it !in allowedIds }) throw BusinessException(ErrorCode.NOT_FOUND)
    }

    /** 월·일은 함께 있거나 함께 없다. 실제 달력에 없는 날은 거절. 연도가 있으면 그 날짜가 미래일 수 없다. */
    private fun validateBirthday(year: Int?, month: Int?, day: Int?, today: LocalDate) {
        if (month == null && day == null) return
        if (month == null || day == null) throw BusinessException(ErrorCode.INVALID_INPUT)
        // 연도 없는 월·일도 달력상 유효해야 한다 — 윤년을 허용하는 기준연도(2000)로 판정.
        val probeYear = year ?: 2000
        val date = try {
            LocalDate.of(probeYear, month, day)
        } catch (e: java.time.DateTimeException) {
            throw BusinessException(ErrorCode.INVALID_INPUT)
        }
        if (year != null) Validators.notFuture(date, today)
    }
}
