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

-- Create article_tags table
CREATE TABLE article_tags (
    article_id INT NOT NULL, -- Foreign key to articles table
    tag_id INT NOT NULL, -- Foreign key to tags table
    PRIMARY KEY (article_id, tag_id), -- Composite primary key
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE, -- Relation with articles
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE -- Relation with tags
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data into users table
INSERT INTO users (username, email, password, full_name, pen_name, role, date_of_birth) VALUES
('johndoe', 'johndoe@example.com', 'hashedpassword123', 'John Doe', 'JD', 'writer', '1990-01-01'),
('janedoe', 'janedoe@example.com', 'hashedpassword123', 'Jane Doe', 'JD', 'editor', '1985-05-15'),
('guestuser', 'guestuser@example.com', 'hashedpassword123', 'Guest User', NULL, 'guest', NULL);

-- Insert sample data into categories table
INSERT INTO categories (name, description) VALUES
('Technology', 'Latest trends and news in technology.'),
('Science', 'Discoveries and updates in science.'),
('Health', 'Tips and news about health and wellness.'),
('Business', 'News related to business and economy.'),
('Entertainment', 'Latest happenings in the entertainment industry.');

-- Insert sample data into tags table
INSERT INTO tags (name) VALUES
('AI'), ('Blockchain'), ('Startups'), ('Climate Change'), ('Fitness'), ('Movies');

-- Insert sample data into articles table
INSERT INTO articles (title, slug, abstract, content, thumbnail, status, is_premium, publish_date, view_count, author_id, category_id) VALUES
('The Rise of AI in Everyday Life', 'the-rise-of-ai-in-everyday-life', 'Artificial Intelligence is changing the world.', 'Full content about AI here...', NULL, 'published', TRUE, '2024-12-01', 120, 1, 1),
('Blockchain Beyond Cryptocurrency', 'blockchain-beyond-cryptocurrency', 'Blockchain technology explained.', 'Full content about Blockchain here...', NULL, 'published', FALSE, '2024-12-02', 85, 1, 1),
('Top 10 Startups to Watch in 2024', 'top-10-startups-to-watch-in-2024', 'An overview of innovative startups.', 'Full content about Startups here...', NULL, 'published', FALSE, '2024-12-10', 200, 2, 2),
('The Effects of Climate Change', 'the-effects-of-climate-change', 'Climate change and its impacts.', 'Full content about Climate Change here...', NULL, 'pending', FALSE, NULL, 0, 2, 2),
('Fitness Tips for a Healthy Life', 'fitness-tips-for-a-healthy-life', 'Tips to maintain good health.', 'Full content about Fitness here...', NULL, 'published', FALSE, '2024-11-25', 150, 1, 3);

-- Insert sample data into article_tags table
INSERT INTO article_tags (article_id, tag_id) VALUES
(1, 1), (1, 2),
(2, 2), (2, 3),
(3, 3), (3, 4),
(4, 4), (5, 5);
