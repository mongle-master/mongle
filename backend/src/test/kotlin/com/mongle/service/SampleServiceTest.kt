package com.mongle.service

import com.mongle.common.exception.BusinessException
import com.mongle.config.JpaConfig
import com.mongle.domain.Sample
import com.mongle.repository.SampleRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.context.annotation.Import

/**
 * repository ~ service 슬라이스 테스트 (임베디드 H2).
 * SampleService는 @Component가 아니므로 @Import로 직접 등록한다.
 */
@DataJpaTest
@Import(SampleService::class, JpaConfig::class)
class SampleServiceTest(
    @Autowired private val sampleService: SampleService,
    @Autowired private val sampleRepository: SampleRepository,
) {
    @Test
    fun `create는 sample을 저장하고 id를 부여한다`() {
        val saved = sampleService.create("hello")

        assertThat(saved.id).isNotNull()
        assertThat(saved.name).isEqualTo("hello")
        assertThat(sampleRepository.findById(saved.id!!)).isPresent()
    }

    @Test
    fun `get은 존재하지 않는 id에 BusinessException을 던진다`() {
        assertThatThrownBy { sampleService.get(999L) }
            .isInstanceOf(BusinessException::class.java)
    }

    @Test
    fun `getAll은 저장된 모든 sample을 반환한다`() {
        sampleRepository.save(Sample(name = "a"))
        sampleRepository.save(Sample(name = "b"))

        assertThat(sampleService.getAll()).hasSize(2)
    }
}
