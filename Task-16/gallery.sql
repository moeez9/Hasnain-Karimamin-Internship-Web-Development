CREATE DATABASE IF NOT EXISTS task16_gallery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE task16_gallery;

CREATE TABLE IF NOT EXISTS gallery_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_url VARCHAR(512) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

TRUNCATE TABLE gallery_items;

INSERT INTO gallery_items (title, image_url, description, category, created_at) VALUES
('AI Vision Dashboard', 'https://picsum.photos/seed/ai1/900/650', 'A modern dashboard layout for computer vision analytics.', 'AI Projects', '2024-12-20 10:15:00'),
('Mobile App Onboarding', 'https://picsum.photos/seed/mobile1/900/650', 'An immersive mobile onboarding flow for app users.', 'Mobile Apps', '2024-11-14 08:30:00'),
('Web Design Portfolio', 'https://picsum.photos/seed/web1/900/750', 'A responsive portfolio website with elegant UI patterns.', 'Web Design', '2024-11-28 14:05:00'),
('Python Data Tools', 'https://picsum.photos/seed/python1/900/650', 'A visualization suite for Python data science workflows.', 'Python Projects', '2024-12-02 16:40:00'),
('AI Assistant Web App', 'https://picsum.photos/seed/ai2/900/700', 'A conversational AI interface designed for fast workflows.', 'AI Projects', '2024-12-04 09:20:00'),
('Marketplace Landing', 'https://picsum.photos/seed/web2/900/650', 'A premium landing page optimized for conversion.', 'Web Design', '2024-11-18 11:45:00'),
('Mobile Health Tracker', 'https://picsum.photos/seed/mobile2/900/650', 'A clean mobile interface for tracking wellness metrics.', 'Mobile Apps', '2024-12-12 19:05:00'),
('Python Automation Suite', 'https://picsum.photos/seed/python2/900/700', 'Backend automation utilities built with Python programming.', 'Python Projects', '2024-12-08 13:55:00');
