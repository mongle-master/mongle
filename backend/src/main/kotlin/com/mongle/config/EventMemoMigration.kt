package com.mongle.config

import org.slf4j.LoggerFactory
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

/**
 * why/what → memo 컬럼 전환.
 * ddl-auto: update 는 컬럼 추가만 하고 구 컬럼·데이터 이전은 하지 않으므로 기동 시 1회 실행한다.
 */
@Component
class EventMemoMigration(
    private val jdbcTemplate: JdbcTemplate,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @EventListener(ApplicationReadyEvent::class)
    fun migrate() {
        if (!hasColumn("WHY")) return

        jdbcTemplate.update(
            """
            UPDATE event
            SET memo = CASE
                WHEN why IS NOT NULL AND TRIM(why) <> '' AND what IS NOT NULL AND TRIM(what) <> ''
                    THEN TRIM(why) || CHAR(10) || TRIM(what)
                WHEN why IS NOT NULL AND TRIM(why) <> '' THEN TRIM(why)
                WHEN what IS NOT NULL AND TRIM(what) <> '' THEN TRIM(what)
                ELSE memo
            END
            WHERE (why IS NOT NULL AND TRIM(why) <> '')
               OR (what IS NOT NULL AND TRIM(what) <> '')
            """.trimIndent(),
        )

        jdbcTemplate.execute("ALTER TABLE event DROP COLUMN IF EXISTS why")
        jdbcTemplate.execute("ALTER TABLE event DROP COLUMN IF EXISTS what")
        log.info("Migrated event.why/event.what to event.memo")
    }

    private fun hasColumn(columnName: String): Boolean {
        val count = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE UPPER(TABLE_NAME) = 'EVENT' AND UPPER(COLUMN_NAME) = ?
            """.trimIndent(),
            Int::class.java,
            columnName,
        ) ?: 0
        return count > 0
    }
}
