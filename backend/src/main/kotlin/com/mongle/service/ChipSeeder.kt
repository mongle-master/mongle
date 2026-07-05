package com.mongle.service

import com.mongle.domain.Chip
import com.mongle.domain.ChipType
import com.mongle.repository.ChipRepository
import org.springframework.boot.ApplicationRunner
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

/**
 * 공통 칩 시드. 기동마다 실행되지만 라벨 존재 여부로 멱등하다
 * (파일 H2 는 재기동에도 남으므로 중복 삽입 방지가 필수).
 * 관계태그는 공통용이 없어 시드하지 않는다(모두 개인).
 * 카테고리의 첫 순서 `만남` 이 기본값이다(승계 로직은 ChipService).
 */
@Component
class ChipSeeder(
    private val chipRepository: ChipRepository,
) : ApplicationRunner {
    private val seeds: Map<ChipType, List<String>> = mapOf(
        ChipType.EMOTION to listOf("반가움", "뭉클", "편안", "즐거움", "고마움", "그냥"),
        ChipType.WEATHER to listOf("맑음", "흐림", "비", "쌀쌀", "더움"),
        ChipType.CATEGORY to listOf("만남", "연락", "기념일", "기타"),
    )

    @Transactional
    override fun run(args: org.springframework.boot.ApplicationArguments?) {
        seeds.forEach { (type, labels) ->
            labels.forEachIndexed { order, label ->
                if (!chipRepository.existsByTypeAndOwnerIdIsNullAndLabel(type, label)) {
                    chipRepository.save(Chip(type = type, ownerId = null, label = label, displayOrder = order))
                }
            }
        }
    }
}
