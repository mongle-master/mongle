CREATE TABLE `users` (
  `id` binary(16) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `demo_seeded` bit(1) NOT NULL,
  `gender` enum('FEMALE','MALE') DEFAULT NULL,
  `profile_image_url` varchar(255) DEFAULT NULL,
  `profile_setup_completed` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `chip` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `display_order` int NOT NULL,
  `label` varchar(255) NOT NULL,
  `owner_id` binary(16) DEFAULT NULL,
  `type` enum('CATEGORY','EMOTION','RELATION_TAG','WEATHER') NOT NULL,
  `color` varchar(7) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_chip_type_owner` (`type`,`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `chip_hide` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `chip_id` bigint NOT NULL,
  `owner_id` binary(16) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_chip_hide` (`owner_id`,`chip_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `person` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `birth_day` int DEFAULT NULL,
  `birth_month` int DEFAULT NULL,
  `birth_year` int DEFAULT NULL,
  `favorite` bit(1) NOT NULL,
  `first_met_date` date DEFAULT NULL,
  `last_met_date` date DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `owner_id` binary(16) NOT NULL,
  `profile_image_url` varchar(255) DEFAULT NULL,
  `relation_type` varchar(255) DEFAULT NULL,
  `gender` enum('FEMALE','MALE') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_person_owner` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `person_like` (
  `person_id` bigint NOT NULL,
  `item` varchar(255) DEFAULT NULL,
  `item_order` int NOT NULL,
  PRIMARY KEY (`person_id`,`item_order`),
  CONSTRAINT `FKkjubga7d3cssf6957wdgeees4` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `person_caution` (
  `person_id` bigint NOT NULL,
  `item` varchar(255) DEFAULT NULL,
  `item_order` int NOT NULL,
  PRIMARY KEY (`person_id`,`item_order`),
  CONSTRAINT `FKgnwi6pspi313pdy9itw330b6f` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `person_relation_tag` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `chip_id` bigint NOT NULL,
  `display_order` int NOT NULL,
  `person_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_person_relation_tag_person` (`person_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `event` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `category_chip_id` bigint NOT NULL,
  `occurred_date` date NOT NULL,
  `occurred_time` time(6) DEFAULT NULL,
  `owner_id` binary(16) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `weather_chip_id` bigint DEFAULT NULL,
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_event_owner_date` (`owner_id`,`occurred_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `event_photo` (
  `event_id` bigint NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `photo_order` int NOT NULL,
  PRIMARY KEY (`event_id`,`photo_order`),
  CONSTRAINT `FKfum3n6hr2a0frkk66k895pwuh` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `event_person` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `display_order` int NOT NULL,
  `event_id` bigint NOT NULL,
  `person_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_event_person_event` (`event_id`),
  KEY `idx_event_person_person` (`person_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `event_emotion` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `chip_id` bigint NOT NULL,
  `display_order` int NOT NULL,
  `event_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_event_emotion_event` (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
