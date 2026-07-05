package com.mongle.service

import com.mongle.common.exception.BusinessException
import com.mongle.common.exception.ErrorCode
import com.mongle.domain.Sample
import com.mongle.repository.SampleRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class SampleService(
    private val sampleRepository: SampleRepository,
) {
    @Transactional
    fun create(name: String): Sample = sampleRepository.save(Sample(name = name))

    fun get(id: Long): Sample = sampleRepository.findById(id).orElseThrow {
        BusinessException(ErrorCode.NOT_FOUND, "Sample not found: id=$id")
    }

    fun getAll(): List<Sample> = sampleRepository.findAll()
}
