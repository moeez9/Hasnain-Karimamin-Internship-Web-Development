-- Database schema for Task-12 services admin panel
CREATE DATABASE IF NOT EXISTS `task12` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `task12`;

CREATE TABLE IF NOT EXISTS `services` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `image_url` VARCHAR(512) DEFAULT NULL,
  `category` VARCHAR(100) NOT NULL,
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX (`title`),
  INDEX (`category`),
  INDEX (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Example admin credentials are defined in config.php. You can change them there.

INSERT INTO `services` (`title`, `description`, `image_url`, `category`, `status`) VALUES
('Website Migration', 'Move site assets, database, and DNS to a new host with no downtime.', NULL, 'IT', 'active'),
('Brand Strategy Session', 'A coaching session to define brand voice, positioning, and messaging.', NULL, 'Marketing', 'active');
