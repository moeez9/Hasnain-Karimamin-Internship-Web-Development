-- Database Schema for Dynamic Services
-- Create database
CREATE DATABASE IF NOT EXISTS services_db;
USE services_db;

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    details TEXT NOT NULL,
    image_url VARCHAR(500),
    icon VARCHAR(100),
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_category (category),
    INDEX idx_status (status)
);

-- Insert sample services data
INSERT INTO services (title, slug, description, details, image_url, icon, category, price, status) VALUES
(
    'Web Development',
    'web-development',
    'Custom web application development using modern technologies',
    'We build responsive, scalable web applications using HTML5, CSS3, JavaScript, PHP, and various frameworks. Our web development services include responsive design, SEO optimization, and performance tuning.',
    NULL,
    'fa-globe',
    'Web',
    2500.00,
    'active'
),
(
    'Mobile App Development',
    'mobile-app-development',
    'Native and cross-platform mobile application development',
    'Create powerful mobile applications for iOS and Android platforms. We develop native apps and cross-platform solutions using modern frameworks to ensure optimal performance and user experience.',
    NULL,
    'fa-mobile',
    'Mobile',
    3500.00,
    'active'
),
(
    'AI & Machine Learning',
    'ai-machine-learning',
    'Intelligent solutions powered by artificial intelligence',
    'Implement cutting-edge AI and machine learning solutions for your business. From predictive analytics to natural language processing, we help you leverage AI to drive business growth.',
    NULL,
    'fa-brain',
    'AI',
    4000.00,
    'active'
),
(
    'Cloud Solutions',
    'cloud-solutions',
    'Scalable cloud infrastructure and deployment services',
    'Migrate and deploy your applications to cloud platforms like AWS, Azure, and Google Cloud. We provide migration strategies, infrastructure setup, and ongoing cloud management.',
    NULL,
    'fa-cloud',
    'Cloud',
    2000.00,
    'active'
),
(
    'Database Design & Optimization',
    'database-design',
    'Expert database architecture and performance optimization',
    'Design efficient database schemas and optimize existing systems for peak performance. We handle MySQL, PostgreSQL, MongoDB, and other database technologies.',
    NULL,
    'fa-database',
    'Backend',
    1800.00,
    'active'
),
(
    'UI/UX Design',
    'ui-ux-design',
    'Beautiful and intuitive user interface design',
    'Create stunning user interfaces that drive engagement and conversions. Our UI/UX designers craft interfaces that are both beautiful and highly functional.',
    NULL,
    'fa-palette',
    'Design',
    1500.00,
    'active'
),
(
    'API Development',
    'api-development',
    'RESTful and GraphQL API development services',
    'Build robust APIs that power modern applications. We develop secure, scalable, and well-documented APIs that integrate seamlessly with your systems.',
    NULL,
    'fa-code',
    'Backend',
    2200.00,
    'active'
),
(
    'E-Commerce Solutions',
    'ecommerce-solutions',
    'Complete e-commerce platforms and integrations',
    'Build or enhance your online store with secure payment processing, inventory management, and customer analytics. We work with platforms like WooCommerce, Shopify, and custom solutions.',
    NULL,
    'fa-shopping-cart',
    'Web',
    3000.00,
    'active'
)
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    description = VALUES(description),
    details = VALUES(details),
    image_url = VALUES(image_url),
    icon = VALUES(icon),
    category = VALUES(category),
    price = VALUES(price),
    status = VALUES(status);
