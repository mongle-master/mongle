package com.mongle.repository

import com.mongle.domain.ChipHide
import org.springframework.data.jpa.repository.JpaRepository

interface ChipHideRepository : JpaRepository<ChipHide, Long> {
    fun findByOwnerId(ownerId: Long): List<ChipHide>

    fun existsByOwnerIdAndChipId(ownerId: Long, chipId: Long): Boolean
}
