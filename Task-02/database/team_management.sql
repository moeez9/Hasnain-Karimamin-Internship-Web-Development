CREATE DATABASE IF NOT EXISTS dynamic_about_page
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE dynamic_about_page;

DROP TABLE IF EXISTS team_members;

CREATE TABLE team_members (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    role VARCHAR(100) NOT NULL,
    profile_image VARCHAR(255) NOT NULL,
    bio TEXT NOT NULL,
    linkedin_url VARCHAR(255) DEFAULT NULL,
    github_url VARCHAR(255) DEFAULT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO team_members (name, role, profile_image, bio, linkedin_url, github_url, display_order) VALUES
('Aisha Khan', 'Lead Developer', 'assets/images/team/member-1.svg', 'Aisha leads front-end architecture and helps transform product ideas into reliable, accessible interfaces that scale with the business.', 'https://linkedin.com/in/aisha-khan', 'https://github.com/aishakhan', 1),
('Bilal Ahmed', 'UI/UX Designer', 'assets/images/team/member-2.svg', 'Bilal designs thoughtful user journeys, polished visual systems, and conversion-focused layouts that keep the product feeling clear and confident.', 'https://linkedin.com/in/bilal-ahmed', 'https://github.com/bilalahmed', 2),
('Sara Iqbal', 'Project Manager', 'assets/images/team/member-3.svg', 'Sara keeps timelines grounded, removes blockers quickly, and makes sure every release stays aligned with client goals and team capacity.', 'https://linkedin.com/in/sara-iqbal', 'https://github.com/saraiqbal', 3),
('Hamza Noor', 'Backend Engineer', 'assets/images/team/member-4.svg', 'Hamza builds maintainable APIs, secure data flows, and dependable back-office logic that supports smooth daily operations.', 'https://linkedin.com/in/hamza-noor', 'https://github.com/hamzanoor', 4),
('Maham Ali', 'QA Lead', 'assets/images/team/member-5.svg', 'Maham protects release quality through careful testing, regression coverage, and a strong eye for the details users notice first.', 'https://linkedin.com/in/maham-ali', 'https://github.com/mahamali', 5),
('Usman Tariq', 'Product Strategist', 'assets/images/team/member-6.svg', 'Usman connects business goals with product execution, shaping feature priorities and roadmap decisions with clarity and measurable intent.', 'https://linkedin.com/in/usman-tariq', 'https://github.com/usmantariq', 6);
