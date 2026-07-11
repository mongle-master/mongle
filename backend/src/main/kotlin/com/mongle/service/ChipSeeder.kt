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
 * 표시 순서는 시드 목록 순서가 SSOT — 기존 행도 순서가 다르면 목록 순서로 갱신한다.
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
        // 프론트 기록 퍼널이 "오늘은 ___다" 문장용 과거형 매핑(EMOTION_PAST)을 라벨 기준으로 들고 있다.
        // 감정 라벨을 추가·변경하면 frontend record-activity.tsx 의 매핑도 같이 갱신해야 한다.
        ChipType.EMOTION to listOf(
            "반가움", "뭉클", "편안", "즐거움", "고마움",
            "설렘", "든든", "서운", "아쉬움", "속상", "그냥",
        ),
        ChipType.WEATHER to listOf("맑음", "흐림", "비", "쌀쌀", "더움"),
        ChipType.CATEGORY to listOf("만남", "연락", "기념일", "기타"),
    )

    @Transactional
    override fun run(args: org.springframework.boot.ApplicationArguments?) {
        seeds.forEach { (type, labels) ->
            labels.forEachIndexed { order, label ->
                val existing = chipRepository.findByTypeAndOwnerIdIsNullAndLabelAndDeletedAtIsNull(type, label)
                if (existing == null) {
                    chipRepository.save(Chip(type = type, ownerId = null, label = label, displayOrder = order))
                } else if (existing.displayOrder != order) {
                    // 시드 목록 중간에 라벨을 끼워 넣어도(예: "그냥" 앞 감정 추가)
                    // 기존 DB의 표시 순서가 목록 순서를 따라오도록 맞춘다.
                    existing.displayOrder = order
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
