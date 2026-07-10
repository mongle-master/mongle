package com.mongle.repository

import com.mongle.domain.ChipHide
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ChipHideRepository : JpaRepository<ChipHide, Long> {
    fun findByOwnerId(ownerId: UUID): List<ChipHide>

    fun existsByOwnerIdAndChipId(ownerId: UUID, chipId: Long): Boolean
}
