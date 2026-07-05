package com.mongle.config

import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaAuditing

/**
 * JPA 감사(@CreatedDate / @LastModifiedDate) 활성화.
 */
@Configuration
@EnableJpaAuditing
class JpaConfig
