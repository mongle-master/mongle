package com.mongle.service

import java.time.LocalDate
import java.time.temporal.ChronoUnit

/** 친밀도 판정 상태(#41). UNKNOWN=주기를 알 수 없어 판정 보류(멀어짐 아님). */
enum class IntimacyStatus {
    UNKNOWN,
    NORMAL,
    DISTANT,
}

/**
 * 관계 친밀도(#41). 저장하지 않고 조회 시 그 인물의 만남 고유 날짜로만 판정한다 —
 * 만난 횟수·마지막 만남과 같은 단일 근거(meetingDatesDesc)를 공유해 서로 어긋나지 않게 한다.
 *
 * 판정 근거(암묵지): 고정 기간이 아니라 그 사람의 *평소 주기* 를 기준으로 한다(PRD 01 §5).
 * 만남이 부족해 주기를 알 수 없으면 흐리게(멀어짐) 하지 않는다. 즐겨찾기여도 판정은 동일(강조는 프론트).
 */
data class Intimacy(
    val status: IntimacyStatus,
    // 평소 만남 주기(평균 간격, 일). 판정 보류면 null.
    val averageIntervalDays: Int?,
    // 마지막 만남 이후 경과일. 만남 기록이 없으면 null.
    val daysSinceLastMeet: Int?,
) {
    companion object {
        // 이 개수 미만이면 연속 간격을 낼 수 없어 주기 판정을 보류한다.
        const val MIN_MEETINGS = 2

        // 평소 주기 대비 이 배수를 초과해 안 만났으면 '멀어짐'. 튜닝 지점.
        const val DISTANT_MULTIPLIER = 2.0

        /**
         * meetingDatesDesc = 만남 카테고리 고유 날짜(최신 먼저, PersonStats).
         * 고유 날짜라 연속 간격은 항상 ≥1 이고, 만남은 미래일 수 없어 경과일은 ≥0 이다.
         */
        fun of(meetingDatesDesc: List<LocalDate>, today: LocalDate): Intimacy {
            val lastMet = meetingDatesDesc.firstOrNull()
            val daysSinceLastMeet = lastMet?.let { ChronoUnit.DAYS.between(it, today).toInt() }
            if (meetingDatesDesc.size < MIN_MEETINGS) {
                return Intimacy(IntimacyStatus.UNKNOWN, averageIntervalDays = null, daysSinceLastMeet = daysSinceLastMeet)
            }
            val averageInterval = meetingDatesDesc.sorted().zipWithNext { a, b -> ChronoUnit.DAYS.between(a, b) }.average()
            val status = if (daysSinceLastMeet!! > averageInterval * DISTANT_MULTIPLIER) IntimacyStatus.DISTANT else IntimacyStatus.NORMAL
            return Intimacy(status, averageIntervalDays = Math.round(averageInterval).toInt(), daysSinceLastMeet = daysSinceLastMeet)
        }
    }
}
