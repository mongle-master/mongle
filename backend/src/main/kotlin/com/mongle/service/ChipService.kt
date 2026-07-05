package com.mongle.service

import com.mongle.domain.Chip
import com.mongle.domain.ChipType
import com.mongle.repository.ChipHideRepository
import com.mongle.repository.ChipRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class ChipService(
    private val chipRepository: ChipRepository,
    private val chipHideRepository: ChipHideRepository,
) {
    /**
     * 사용자 시점 목록 = 공통(안 숨긴 것) + 내 개인(안 지운 것). 공통 먼저·각 표시순서.
     * 다른 서비스(기록·인물)의 칩 참조 검증도 이 집합을 기준으로 한다.
     */
    fun visibleChips(userId: Long, type: ChipType): List<Chip> {
        val hidden = chipHideRepository.findByOwnerId(userId).map { it.chipId }.toSet()
        val common = chipRepository
            .findByTypeAndOwnerIdIsNullAndDeletedAtIsNullOrderByDisplayOrderAsc(type)
            .filter { it.id !in hidden }
        val personal = chipRepository
            .findByTypeAndOwnerIdAndDeletedAtIsNullOrderByDisplayOrderAsc(type, userId)
        return common + personal
    }
}
