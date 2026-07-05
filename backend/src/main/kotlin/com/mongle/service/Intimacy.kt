package com.mongle.service

/** 친밀도 판정 상태(#41). UNKNOWN=주기를 알 수 없어 판정 보류(멀어짐 아님). 판정 알고리즘은 #41에서 채운다. */
enum class IntimacyStatus {
    UNKNOWN,
    NORMAL,
    DISTANT,
}
