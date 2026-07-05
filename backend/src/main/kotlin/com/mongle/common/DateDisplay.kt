package com.mongle.common

import java.time.LocalDate
import java.time.Period
import java.time.temporal.ChronoUnit

/**
 * 날짜 파생값의 표시 문자열을 한곳에서 만든다(§12.4). 인물 프로필(#30)·타임라인(#44)이 공유한다 —
 * 버킷 경계가 여러 화면에 흩어지면 drift 가 나므로 규칙을 코드로 모아 둔다.
 * 원시값(경과일수 등)은 호출부가 함께 노출해 프론트가 재포맷할 여지를 남긴다.
 */
object DateDisplay {
    /** 처음 만난 날 경과: 만난 날을 1일째로 센다. */
    fun daysSinceFirstMet(firstMet: LocalDate, today: LocalDate): Int = (ChronoUnit.DAYS.between(firstMet, today) + 1).toInt()

    /** 알고 지낸 기간: 가장 큰 단위 하나만. */
    fun acquaintancePeriod(firstMet: LocalDate, today: LocalDate): String {
        val period = Period.between(firstMet, today)
        return when {
            period.years >= 1 -> "${period.years}년"
            period.months >= 1 -> "${period.months}개월"
            else -> "${period.days}일"
        }
    }

    /** 상대시간. 30일=1개월·365일=1년으로 내림해 가장 가까운 상위 단위로 표시한다. */
    fun relativeTime(date: LocalDate, today: LocalDate): String {
        val days = ChronoUnit.DAYS.between(date, today)
        return when {
            days <= 0L -> "오늘"
            days == 1L -> "어제"
            days <= 13L -> "${days}일 전"
            days <= 59L -> "${days / 7}주 전"
            days <= 364L -> "${days / 30}개월 전"
            else -> "${days / 365}년 전"
        }
    }
}
