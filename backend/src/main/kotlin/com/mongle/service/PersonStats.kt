package com.mongle.service

import java.time.LocalDate

/**
 * 인물 파생 스탯(#30). 저장하지 않고 조회 시 이벤트 기준으로 계산한다 — 수정·삭제에도 일관되게.
 *
 * meetingDatesDesc 는 만남 카테고리 고유 날짜(최신 먼저)로, 만난 횟수·마지막 만남·만남 주기의 단일 근거다.
 * 홈 친밀도(#41)는 이 목록에서 방문 간격(주기)을 뽑아 쓴다.
 */
data class PersonStats(
    val meetingDatesDesc: List<LocalDate>,
    val recordCount: Int,
    // max(person.lastMetDate, 만남 기록 최신 날짜). 처음 만난 날보다 앞선 후보는 제외, 둘 다 없으면 null.
    val lastMetDate: LocalDate?,
) {
    val meetCount: Int get() = meetingDatesDesc.size
}
