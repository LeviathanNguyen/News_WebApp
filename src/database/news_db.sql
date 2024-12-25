-- Create database
DROP DATABASE IF EXISTS news_db;
CREATE DATABASE IF NOT EXISTS news_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE news_db;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Primary key
    username VARCHAR(50) NOT NULL UNIQUE, -- Unique username
    email VARCHAR(100) NOT NULL UNIQUE, -- Unique email
    password VARCHAR(255) NOT NULL, -- Password for authentication
    full_name VARCHAR(100), -- Full name of the user
    pen_name VARCHAR(100), -- Pen name for writers
    role ENUM('guest', 'subscriber', 'writer', 'editor', 'admin') DEFAULT 'guest', -- User role
    date_of_birth DATE, -- Date of birth
    subscription_expires_at DATETIME, -- Expiration date for subscription
    reset_token VARCHAR(255), -- Token for password reset
    reset_token_expires DATETIME, -- Expiration of reset token
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Record creation time
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Record update time
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create password_resets table
CREATE TABLE password_resets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used BOOLEAN DEFAULT FALSE,
    INDEX idx_email (email),
    INDEX idx_otp (otp),
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create sessions table
CREATE TABLE sessions (
    session_id VARCHAR(128) PRIMARY KEY,
    expires TIMESTAMP NOT NULL,
    data TEXT,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE sessions CHANGE COLUMN `expires` `expires` BIGINT(20) NOT NULL ;
-- Create categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Primary key
    name VARCHAR(100) NOT NULL UNIQUE, -- Unique category name
    description TEXT, -- Description of the category
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Record creation time
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Record update time
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create tags table
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Primary key
    name VARCHAR(100) NOT NULL UNIQUE, -- Unique tag name
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Record creation time
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Record update time
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create articles table
CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Primary key
    title VARCHAR(255) NOT NULL, -- Article title
    slug VARCHAR(255) NOT NULL UNIQUE, -- Unique slug for the article
    abstract TEXT NOT NULL, -- Brief summary of the article
    content TEXT NOT NULL, -- Full content of the article
    thumbnail VARCHAR(255), -- Path to the thumbnail image
    status ENUM('draft', 'pending', 'published', 'rejected') DEFAULT 'draft', -- Status of the article
    rejection_reason TEXT, -- Reason for rejection if applicable
    is_premium BOOLEAN DEFAULT FALSE, -- Indicates if the article is premium content
    publish_date DATETIME, -- Publish date of the article
    view_count INT DEFAULT 0, -- Number of views
    author_id INT NOT NULL, -- Foreign key to users table
    category_id INT NOT NULL, -- Foreign key to categories table
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Record creation time
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Record update time
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE, -- Relation with users
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE -- Relation with categories
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE `articles` 
ADD COLUMN `admin_id` INT NULL AFTER `category_id`;
-- Create article_tags table
CREATE TABLE article_tags (
    article_id INT NOT NULL, -- Foreign key to articles table
    tag_id INT NOT NULL, -- Foreign key to tags table
    PRIMARY KEY (article_id, tag_id), -- Composite primary key
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE, -- Relation with articles
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE -- Relation with tags
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data into users table, pass: Anh1102@
INSERT INTO users (username, email, password, full_name, pen_name, role, date_of_birth) VALUES
("johndoe", "johndoe@example.com", "hashedpassword123", "John Doe", "JD", "writer", "1990-01-01"),
("janedoe", "janedoe@example.com", "hashedpassword123", "Jane Doe", "JD", "editor", "1985-05-15"),
("admin","admin@gmail.com","$2b$10$k03AWD91J481Q/efjYrDh.oZgNuEUl7dXHlDVomgINBHz7RFuRkru","admin","admin","admin",NULL),
("guestuser", "guestuser@example.com", "hashedpassword123", "Guest User", NULL, "guest", NULL);

-- Insert sample data into categories table
INSERT INTO categories (name, description) VALUES
("AI", "Topics related to artificial intelligence, machine learning, and AI applications in daily life"),
("Blockchain", "Blockchain technology, cryptocurrency, and decentralized applications (DApps)"),
("Startups", "News about startup companies, innovation, and the startup ecosystem"),
("Weather", "Climate change, environmental issues, and sustainable development solutions"),
("Fitness", "Topics about exercise, sports, health training, and healthy lifestyle"),
("Movies", "Film news, movie reviews, and entertainment industry trends"),
("Education", "Education, training, e-learning, and modern learning methods"),
("Sports", "Professional sports, tournaments, and sports news"),
("Technology", "New technology trends, gadgets, and innovations in the tech field"),
("Health", "Health advice, nutrition, and healthcare guidelines"),
("Business", "Business news, markets, and economic trends"),
("Science", "New scientific discoveries, breakthrough research, and advances in science"),
("Entertainment", "Entertainment news, showbiz, and cultural events");

-- Insert sample data into tags table
INSERT INTO tags (name) VALUES
("AI"), ("Blockchain"), ("Startups"), ("Weather"), ("Fitness"), ("Movies"), ("Education"),
("Sports"), ("Technology"), ("Health"), ("Business"), ("Science"), ("Entertainment");

-- Insert sample data into articles table
INSERT INTO articles (title, slug, abstract, content, status, is_premium, publish_date, view_count, author_id, category_id) VALUES
("The Impact of 5G Technology on Smart Cities", 
"impact-5g-technology-smart-cities", 
"How 5G is revolutionizing urban development and creating smarter cities",
"Detailed exploration of how 5G networks are enabling smart city initiatives, from traffic management to waste collection...",
"published", TRUE, "2024-12-15", 180, 1, 1),

("Quantum Computing: A New Era of Technology", 
"quantum-computing-new-era", 
"Understanding the revolutionary potential of quantum computing",
"In-depth analysis of quantum computing principles and their potential applications in various industries...",
"published", FALSE, "2024-12-16", 150, 2, 1),

("Cybersecurity Trends for 2025", 
"cybersecurity-trends-2025", 
"Essential cybersecurity measures for the coming year",
"Comprehensive overview of emerging cybersecurity threats and defense strategies...",
"published", TRUE, "2024-12-17", 200, 1, 1);


INSERT INTO articles (title, slug, abstract, content, status, is_premium, publish_date, view_count, author_id, category_id) VALUES
("Breakthroughs in Renewable Energy Storage", 
"renewable-energy-storage-breakthroughs", 
"New technologies revolutionizing renewable energy storage",
"Detailed analysis of recent innovations in energy storage technology...",
"published", FALSE, "2024-12-15", 160, 2, 2),

("Mars Colonization: Latest Developments", 
"mars-colonization-latest-developments", 
"Updates on humanity's progress toward Mars colonization",
"Comprehensive coverage of recent advances in Mars colonization technology...",
"published", TRUE, "2024-12-16", 220, 1, 2),

("Ocean Conservation Technologies", 
"ocean-conservation-technologies", 
"New technologies helping to preserve marine ecosystems",
"In-depth look at innovative solutions for ocean conservation...",
"published", FALSE, "2024-12-17", 175, 2, 2);


INSERT INTO articles (title, slug, abstract, content, status, is_premium, publish_date, view_count, author_id, category_id) VALUES
("Mental Health in the Digital Age", 
"mental-health-digital-age", 
"Managing mental wellness in an increasingly connected world",
"Comprehensive guide to maintaining mental health in the modern digital landscape...",
"published", TRUE, "2024-12-15", 190, 1, 3),

("Nutrition Myths Debunked", 
"nutrition-myths-debunked", 
"Scientific analysis of common nutrition misconceptions",
"Evidence-based examination of popular nutrition claims and myths...",
"published", FALSE, "2024-12-16", 165, 2, 3),

("Breakthrough in Alzheimer's Research", 
"alzheimers-research-breakthrough", 
"New discoveries in Alzheimer's disease treatment",
"Detailed coverage of recent advances in Alzheimer's disease research...",
"published", TRUE, "2024-12-17", 210, 1, 3);


INSERT INTO articles (title, slug, abstract, content, status, is_premium, publish_date, view_count, author_id, category_id) VALUES
("Sustainable Business Practices in 2025", 
"sustainable-business-practices-2025", 
"How businesses are adapting to environmental challenges",
"Analysis of successful sustainable business strategies and their implementation...",
"published", TRUE, "2024-12-15", 175, 2, 4),

("The Rise of Digital Currencies in Global Trade", 
"digital-currencies-global-trade", 
"Impact of digital currencies on international commerce",
"Comprehensive examination of how digital currencies are transforming global trade...",
"published", FALSE, "2024-12-16", 195, 1, 4),

("AI in Business Decision Making", 
"ai-business-decision-making", 
"How AI is revolutionizing corporate strategy",
"In-depth analysis of AI applications in business strategy and decision-making...",
"published", TRUE, "2024-12-17", 185, 2, 4);


INSERT INTO articles (title, slug, abstract, content, status, is_premium, publish_date, view_count, author_id, category_id) VALUES
("The Evolution of Streaming Platforms", 
"evolution-streaming-platforms", 
"How streaming services are changing entertainment consumption",
"Detailed analysis of the streaming industry's impact on entertainment...",
"published", FALSE, "2024-12-15", 230, 1, 5),

("Virtual Reality in Gaming: 2025 Outlook", 
"virtual-reality-gaming-2025", 
"The future of gaming technology and virtual reality",
"Comprehensive overview of VR gaming trends and future developments...",
"published", TRUE, "2024-12-16", 200, 2, 5),

("The Rise of Independent Content Creators", 
"rise-independent-content-creators", 
"How social media is transforming entertainment",
"In-depth look at the growing influence of independent content creators...",
"published", FALSE, "2024-12-17", 185, 1, 5);

-- Insert sample data into article_tags table
INSERT INTO article_tags (article_id, tag_id) VALUES
(1, 1), (1, 3), -- Technology articles
(2, 1), (2, 2),
(3, 1), (3, 5),
(4, 4), (4, 6), -- Science articles
(5, 3), (5, 4),
(6, 4), (6, 5),
(7, 5), (7, 7), -- Health articles
(8, 5), (8, 1),
(9, 5), (9, 6),
(10, 2), (10, 3), -- Business articles
(11, 2), (11, 4),
(12, 1), (12, 3),
(13, 6), (13, 7), -- Entertainment articles
(14, 6), (14, 1),
(15, 6), (15, 7);
