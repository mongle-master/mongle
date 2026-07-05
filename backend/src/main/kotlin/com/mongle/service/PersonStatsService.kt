package com.mongle.service

import com.mongle.domain.Person
import com.mongle.repository.EventRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * 인물 파생 스탯 계산(#30). 조회 시(서비스 레이어) 이벤트 기준으로 계산하고 소프트삭제된 기록은 제외한다.
 *
 * 상세 조회(#25)뿐 아니라 홈 관계지도(#40 노드 친밀도)·타임라인이 재사용하는 진입점이라 서비스로 분리했다.
 * 홈 친밀도(#41)는 statsOf(...).meetingDatesDesc 로 방문 간격(주기)을 계산한다.
 */
@Service
@Transactional(readOnly = true)
class PersonStatsService(
    private val eventRepository: EventRepository,
    private val chipService: ChipService,
) {
    fun statsOf(person: Person): PersonStats {
        val personId = requireNotNull(person.id) { "저장되지 않은 Person 의 스탯은 계산할 수 없습니다." }

        // 만남 앵커(공통 만남 칩)는 rename·삭제가 막혀 있어 안정적이다. 없으면(방어) 만남 스탯은 0.
        val meetingDates = chipService.meetingCategoryId()
            ?.let { eventRepository.findDistinctMeetingDatesDesc(personId, it) }
            ?: emptyList()

        // 마지막 만남 = 수기 입력값과 만남 기록 최신 날짜 중 더 최근. 이벤트가 과거로 수정·삭제돼도 조회 시 다시 맞춰진다.
        val lastMetDate = listOfNotNull(person.lastMetDate, meetingDates.firstOrNull()).maxOrNull()

        return PersonStats(
            meetingDatesDesc = meetingDates,
            recordCount = eventRepository.countByPersonId(personId).toInt(),
            lastMetDate = lastMetDate,
        )
    }
}
