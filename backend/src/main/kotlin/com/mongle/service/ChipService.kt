package com.mongle.service

import com.mongle.common.Messages
import com.mongle.common.ValidationLimits
import com.mongle.common.Validators
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

    @Transactional
    fun create(userId: Long, type: ChipType, rawLabel: String): Chip {
        val label = rawLabel.trim()
        Validators.requireNotBlank(label, Messages.REQUIRED_CHIP_NAME)
        Validators.maxLength(label, ValidationLimits.CHIP_NAME_MAX)
        assertNoDuplicate(userId, type, label)
        Validators.chipKindLimit(chipRepository.countByTypeAndOwnerIdAndDeletedAtIsNull(type, userId))

        val nextOrder = (chipRepository.findFirstByTypeAndOwnerIdOrderByDisplayOrderDesc(type, userId)?.displayOrder ?: -1) + 1
        return chipRepository.save(Chip(type = type, ownerId = userId, label = label, displayOrder = nextOrder))
    }

    /** 같은 종류 안 중복(공통 전체 + 내 개인 active). excludeId 는 이름변경 시 자기 자신 제외. */
    private fun assertNoDuplicate(userId: Long, type: ChipType, label: String, excludeId: Long? = null) {
        val commonDup = chipRepository.existsByTypeAndOwnerIdIsNullAndLabelAndDeletedAtIsNull(type, label)
        val personalDup = if (excludeId == null) {
            chipRepository.existsByTypeAndOwnerIdAndLabelAndDeletedAtIsNull(type, userId, label)
        } else {
            chipRepository.existsByTypeAndOwnerIdAndLabelAndDeletedAtIsNullAndIdNot(type, userId, label, excludeId)
        }
        Validators.rejectDuplicate(commonDup || personalDup)
    }
}
