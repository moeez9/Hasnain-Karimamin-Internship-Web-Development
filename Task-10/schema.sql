CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default admin user (Password is 'admin123' - bcrypt hash)
INSERT IGNORE INTO `admin_users` (`username`, `password_hash`) VALUES
('admin', '$2y$12$aoH0pBujS0BO/lILRIdQhuDvaklGUo.wSlZNjg9lT/gHJcunFkq.O');

UPDATE `admin_users`
SET `password_hash` = '$2y$12$aoH0pBujS0BO/lILRIdQhuDvaklGUo.wSlZNjg9lT/gHJcunFkq.O'
WHERE `username` = 'admin';

CREATE TABLE IF NOT EXISTS `about` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `mission` text NOT NULL,
  `vision` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default about record
INSERT IGNORE INTO `about` (`id`, `company_name`, `description`, `mission`, `vision`, `image_url`) VALUES
(1, 'Your Company Name', '<p>Enter your company description here.</p>', 'Our mission statement goes here.', 'Our vision statement goes here.', '');

CREATE TABLE IF NOT EXISTS `about_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `about_id` int(11) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `mission` text NOT NULL,
  `vision` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `about_id` (`about_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
