package com.mongle.service

import com.mongle.controller.dto.AvatarGender
import com.mongle.domain.User
import com.mongle.domain.UserGender
import com.mongle.repository.ChipRepository
import com.mongle.repository.EventRepository
import com.mongle.repository.PersonRepository
import com.mongle.repository.UserRepository
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Test
import java.util.Optional
import java.util.UUID
import kotlin.test.assertEquals

class HomeServiceTest {
    private val personRepository = mockk<PersonRepository>()
    private val chipRepository = mockk<ChipRepository>()
    private val personStatsService = mockk<PersonStatsService>()
    private val eventRepository = mockk<EventRepository>()
    private val personService = mockk<PersonService>()
    private val eventService = mockk<EventService>()
    private val userRepository = mockk<UserRepository>()
    private val homeService = HomeService(
        personRepository = personRepository,
        chipRepository = chipRepository,
        personStatsService = personStatsService,
        eventRepository = eventRepository,
        personService = personService,
        eventService = eventService,
        userRepository = userRepository,
    )

    @Test
    fun `관계 지도 중심 노드에 사용자 프로필을 포함한다`() {
        val userId = UUID.randomUUID()
        val user = User(userId, "성빈").apply {
            completeProfileSetup("/default-people/person-male-2.png", UserGender.MALE)
        }
        every { userRepository.findById(userId) } returns Optional.of(user)
        every { personRepository.findByOwnerIdAndDeletedAtIsNull(userId) } returns emptyList()
        every { personService.relationTagChipIdsByPerson(emptyList()) } returns emptyMap()
        every { chipRepository.findAllById(emptyList()) } returns emptyList()

        val response = homeService.relationMap(userId, emptyList())

        assertEquals(userId, response.me.id)
        assertEquals("성빈", response.me.name)
        assertEquals("/default-people/person-male-2.png", response.me.profileImageUrl)
        assertEquals(AvatarGender.MALE, response.me.avatarGender)
    }
}
