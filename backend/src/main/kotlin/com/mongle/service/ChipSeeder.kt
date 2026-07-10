package com.mongle.service

import com.mongle.domain.Chip
import com.mongle.domain.ChipType
import com.mongle.repository.ChipRepository
import org.springframework.boot.ApplicationRunner
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

/**
 * 공통 칩 시드. 기동마다 실행되지만 라벨 존재 여부로 멱등하다
 * (파일 H2 는 재기동에도 남으므로 중복 삽입 방지가 필수).
 * 관계태그는 공통용이 없어 시드하지 않는다(모두 개인).
 * 카테고리의 첫 순서 `만남` 이 기본값이다(승계 로직은 ChipService).
 *
 * 사용자 시드 API가 공통 칩을 라벨로 참조하므로 앱 기동 때 먼저 준비돼 있어야 한다.
 */
@Order(1)
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
        backfillRelationTagColors()
    }

    private fun backfillRelationTagColors() {
        chipRepository.findAll()
            .filter { it.type == ChipType.RELATION_TAG && it.deletedAt == null }
            .groupBy { it.ownerId }
            .values
            .forEach { tags ->
                tags.sortedWith(compareBy<Chip> { it.displayOrder }.thenBy { it.label })
                    .forEachIndexed { index, chip ->
                        if (chip.color == null) {
                            chip.changeColor(RELATION_TAG_COLORS[index % RELATION_TAG_COLORS.size])
                        }
                    }
            }
    }

    companion object {
        private val RELATION_TAG_COLORS = listOf(
            "#E85D75",
            "#0EA5E9",
            "#22A06B",
            "#8B5CF6",
            "#F97316",
            "#65A30D",
            "#14B8A6",
            "#DB2777",
        )
    }
}
