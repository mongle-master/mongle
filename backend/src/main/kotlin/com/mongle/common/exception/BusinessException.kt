package com.mongle.common.exception

/**
 * 비즈니스 규칙 위반을 표현하는 예외.
 */
class BusinessException(
    val errorCode: ErrorCode,
    override val message: String = errorCode.message,
) : RuntimeException(message)
