package com.mongle.common.context

/**
 * 현재 사용자 컨텍스트. JWT 클레임(sub=id, username)만으로 구성되며 DB 조회 없이 만들어진다.
 * 컨트롤러는 필요한 것(id 또는 username)만 골라 쓴다 — id 만 쓰면 서비스에 `user.id` 를 넘긴다.
 */
data class UserPrincipal(
    val id: Long,
    val username: String,
)
