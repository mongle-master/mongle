package com.mongle.service

import com.mongle.controller.dto.UserProfileRequest
import com.mongle.domain.User
import com.mongle.domain.UserGender
import com.mongle.repository.UserRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Test
import java.util.Optional
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class UserServiceTest {
    private val userRepository = mockk<UserRepository>()
    private val userService = UserService(userRepository)

    @Test
    fun `선택한 기본 아바타로 최초 프로필 설정을 완료한다`() {
        val userId = UUID.randomUUID()
        val user = User(userId, "성빈")
        every { userRepository.findById(userId) } returns Optional.of(user)

        val response = userService.completeProfileSetup(
            userId,
            UserProfileRequest(
                profileImageUrl = "/default-people/person-male-2.png",
                gender = UserGender.MALE,
            ),
        )

        assertEquals("/default-people/person-male-2.png", response.profileImageUrl)
        assertEquals(UserGender.MALE, response.gender)
        assertTrue(response.profileSetupCompleted)
    }

    @Test
    fun `프로필 설정을 건너뛰어도 완료 상태를 저장한다`() {
        val userId = UUID.randomUUID()
        val user = User(userId, "성빈")
        every { userRepository.findById(userId) } returns Optional.of(user)

        val response = userService.completeProfileSetup(userId, UserProfileRequest())

        assertEquals(null, response.profileImageUrl)
        assertEquals(null, response.gender)
        assertTrue(response.profileSetupCompleted)
    }

    @Test
    fun `현재 사용자를 삭제한다`() {
        val userId = UUID.randomUUID()
        val user = User(userId, "성빈")
        every { userRepository.findById(userId) } returns Optional.of(user)
        every { userRepository.delete(user) } returns Unit

        userService.deleteCurrentUser(userId)

        verify(exactly = 1) { userRepository.delete(user) }
    }
}
