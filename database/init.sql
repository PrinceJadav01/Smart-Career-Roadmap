-- 📂 Smart Career Roadmap Database Schema & Seed Script (PostgreSQL)

-- 1. Create Tables

-- Drop tables if they exist (for easy re-running/resetting)
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS user_resources CASCADE;
DROP TABLE IF EXISTS completed_quests CASCADE;
DROP TABLE IF EXISTS learning_resources CASCADE;
DROP TABLE IF EXISTS active_quests CASCADE;
DROP TABLE IF EXISTS role_requirements CASCADE;
DROP TABLE IF EXISTS career_roles CASCADE;
DROP TABLE IF EXISTS user_skills CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS weekly_quests CASCADE;
DROP TABLE IF EXISTS quest_questions CASCADE;
DROP TABLE IF EXISTS quest_submissions CASCADE;
DROP TABLE IF EXISTS redeemable_rewards CASCADE;
DROP TABLE IF EXISTS user_redemptions CASCADE;
DROP TABLE IF EXISTS admin_audit_logs CASCADE;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    level INT DEFAULT 1,
    xp INT DEFAULT 0,
    streak INT DEFAULT 0,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bio TEXT,
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    tokens INT DEFAULT 0,
    phone_number VARCHAR(15),
    education_level VARCHAR(50),
    field_of_study VARCHAR(100)
);

-- Skills table
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL -- 'Frontend', 'Backend', 'Python & ML'
);

-- User-Skills level tracking
CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    level INT DEFAULT 0 CHECK (level >= 0 AND level <= 5),
    CONSTRAINT unique_user_skill UNIQUE (user_id, skill_id)
);

-- Career Roles table
CREATE TABLE career_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    demand VARCHAR(50) NOT NULL, -- 'High Demand', 'Critical'
    salary_range VARCHAR(50) NOT NULL
);

-- Role Requirements (Skills weighted for each role)
CREATE TABLE role_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES career_roles(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    importance INT DEFAULT 3 CHECK (importance >= 1 AND importance <= 5),
    CONSTRAINT unique_role_requirement UNIQUE (role_id, skill_id)
);

-- Active target quest for user
CREATE TABLE active_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    role_id UUID REFERENCES career_roles(id) ON DELETE CASCADE,
    progress_percent INT DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    is_completed BOOLEAN DEFAULT FALSE
);

-- Learning Resources Catalog
CREATE TABLE learning_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    platform VARCHAR(50) NOT NULL, -- 'YouTube', 'Udemy', 'Coursera', 'Official Docs'
    url VARCHAR(255) NOT NULL,
    duration VARCHAR(50),
    cost VARCHAR(50) -- 'Free', 'Paid'
);

-- User Achievements unlocked
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_key VARCHAR(100) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_key)
);

-- User learning resources tracking (completion log)
CREATE TABLE user_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES learning_resources(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_resource UNIQUE (user_id, resource_id)
);

-- User completed quests history log
CREATE TABLE completed_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES career_roles(id) ON DELETE CASCADE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_completed_role UNIQUE (user_id, role_id)
);

-- Weekly Quests (MCQ Quiz)
CREATE TABLE weekly_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    end_date TIMESTAMP NOT NULL,
    reward_tokens INT DEFAULT 100
);

-- Quiz Questions (MCQ)
CREATE TABLE quest_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weekly_quest_id UUID REFERENCES weekly_quests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a VARCHAR(200) NOT NULL,
    option_b VARCHAR(200) NOT NULL,
    option_c VARCHAR(200) NOT NULL,
    option_d VARCHAR(200) NOT NULL,
    correct_option VARCHAR(1) NOT NULL,
    points INT DEFAULT 10
);

-- User Quest Submissions (for scoring & speed ranking)
CREATE TABLE quest_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    weekly_quest_id UUID REFERENCES weekly_quests(id) ON DELETE CASCADE,
    score INT NOT NULL,
    duration_seconds INT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tokens_earned INT NOT NULL,
    CONSTRAINT unique_user_quest UNIQUE (user_id, weekly_quest_id)
);

-- Redeemable Rewards Catalog (Water bottles, T-Shirts, Pens, Resume Reviews, etc.)
CREATE TABLE redeemable_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    token_cost INT NOT NULL,
    image_url TEXT DEFAULT '',
    reward_url VARCHAR(255) DEFAULT ''
);

-- User Redemptions & Order Delivery Tracking list
CREATE TABLE user_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reward_id UUID REFERENCES redeemable_rewards(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL DEFAULT '',
    phone_number VARCHAR(20) NOT NULL DEFAULT '',
    shipping_address TEXT NOT NULL DEFAULT '',
    status VARCHAR(50) DEFAULT 'Waiting', -- 'Waiting', 'Dispatched', 'Delivered'
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Audit Logs list
CREATE TABLE admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL,
    admin_name VARCHAR(100) NOT NULL,
    action VARCHAR(200) NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 2. Insert Seed/Initial Data

-- Insert Skills
INSERT INTO skills (id, name, category) VALUES
('a0000000-0000-0000-0000-000000000001', 'HTML & CSS', 'Frontend'),
('a0000000-0000-0000-0000-000000000002', 'JavaScript', 'Frontend'),
('a0000000-0000-0000-0000-000000000003', 'React JS', 'Frontend'),
('a0000000-0000-0000-0000-000000000004', 'TypeScript', 'Frontend'),
('a0000000-0000-0000-0000-000000000005', 'Tailwind CSS', 'Frontend'),
('a0000000-0000-0000-0000-000000000006', 'C# Programming', 'Backend'),
('a0000000-0000-0000-0000-000000000007', 'ASP.NET Core', 'Backend'),
('a0000000-0000-0000-0000-000000000008', 'REST APIs', 'Backend'),
('a0000000-0000-0000-0000-000000000009', 'PostgreSQL', 'Backend'),
('a0000000-0000-0000-0000-000000000010', 'Node.js', 'Backend'),
('a0000000-0000-0000-0000-000000000011', 'Python Core', 'Python & ML'),
('a0000000-0000-0000-0000-000000000012', 'FastAPI', 'Python & ML'),
('a0000000-0000-0000-0000-000000000013', 'scikit-learn', 'Python & ML'),
('a0000000-0000-0000-0000-000000000014', 'Pandas & NumPy', 'Python & ML'),
('a0000000-0000-0000-0000-000000000015', 'Docker', 'Backend'),
('a0000000-0000-0000-0000-000000000016', 'AWS', 'Backend'),
('a0000000-0000-0000-0000-000000000017', 'Git', 'Frontend'),
('a0000000-0000-0000-0000-000000000018', 'Kubernetes', 'Backend'),
('a0000000-0000-0000-0000-000000000019', 'Cybersecurity Basics', 'Backend'),
('a0000000-0000-0000-0000-000000000020', 'Figma', 'Frontend'),
('a0000000-0000-0000-0000-000000000021', 'UX Research', 'Frontend'),
('a0000000-0000-0000-0000-000000000022', 'Agile & Scrum', 'Python & ML'),
('a0000000-0000-0000-0000-000000000023', 'Product Management', 'Python & ML'),
('a0000000-0000-0000-0000-000000000024', 'Technical Writing', 'Python & ML'),
('a0000000-0000-0000-0000-000000000025', 'Business Analysis', 'Python & ML'),
('a0000000-0000-0000-0000-000000000026', 'Blockchain & Solidity', 'Backend'),
('a0000000-0000-0000-0000-000000000027', 'Data Visualization', 'Python & ML'),
('a0000000-0000-0000-0000-000000000028', 'QA & Testing', 'Backend'),
('a0000000-0000-0000-0000-000000000029', 'SEO & Marketing', 'Python & ML'),
('a0000000-0000-0000-0000-000000000030', 'IT Support & Networking', 'Backend'),
('a0000000-0000-0000-0000-000000000031', 'Mobile Dev (iOS/Android)', 'Frontend');

-- Insert Career Roles
INSERT INTO career_roles (id, name, demand, salary_range) VALUES
('b0000000-0000-0000-0000-000000000001', 'Frontend Developer', 'High Demand', '₹6-18 LPA'),
('b0000000-0000-0000-0000-000000000002', 'Backend Developer', 'Critical', '₹8-22 LPA'),
('b0000000-0000-0000-0000-000000000003', 'Full Stack Developer', 'Critical', '₹10-25 LPA'),
('b0000000-0000-0000-0000-000000000004', 'Machine Learning Engineer', 'High Demand', '₹12-28 LPA'),
('b0000000-0000-0000-0000-000000000005', 'Data Scientist', 'High Demand', '₹15-30 LPA'),
('b0000000-0000-0000-0000-000000000006', 'DevOps Engineer', 'Critical', '₹15-28 LPA'),
('b0000000-0000-0000-0000-000000000007', 'Cloud Architect', 'Critical', '₹18-35 LPA'),
('b0000000-0000-0000-0000-000000000008', 'Cybersecurity Analyst', 'High Demand', '₹10-25 LPA'),
('b0000000-0000-0000-0000-000000000009', 'Mobile App Developer', 'High Demand', '₹8-20 LPA'),
('b0000000-0000-0000-0000-000000000010', 'UI/UX Designer', 'High Demand', '₹6-18 LPA'),
('b0000000-0000-0000-0000-000000000011', 'Product Manager', 'High Demand', '₹15-35 LPA'),
('b0000000-0000-0000-0000-000000000012', 'Scrum Master', 'Average', '₹12-24 LPA'),
('b0000000-0000-0000-0000-000000000013', 'Technical Writer', 'Average', '₹6-15 LPA'),
('b0000000-0000-0000-0000-000000000014', 'Business Analyst', 'High Demand', '₹8-20 LPA'),
('b0000000-0000-0000-0000-000000000015', 'IT Support Specialist', 'Average', '₹3-8 LPA'),
('b0000000-0000-0000-0000-000000000016', 'Blockchain Developer', 'High Demand', '₹15-30 LPA'),
('b0000000-0000-0000-0000-000000000017', 'Data Analyst', 'High Demand', '₹6-16 LPA'),
('b0000000-0000-0000-0000-000000000018', 'QA Engineer', 'Average', '₹6-15 LPA'),
('b0000000-0000-0000-0000-000000000019', 'Digital Marketing Specialist', 'High Demand', '₹5-12 LPA');

-- Insert Role Requirements (Skills weights mapping)
-- Frontend Developer
INSERT INTO role_requirements (role_id, skill_id, importance) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 5), -- HTML & CSS
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 5), -- JavaScript
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 5), -- React JS
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 4), -- Tailwind CSS
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 4); -- TypeScript

-- Backend Developer
INSERT INTO role_requirements (role_id, skill_id, importance) VALUES
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000006', 5), -- C#
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000007', 5), -- ASP.NET Core
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000008', 5), -- REST APIs
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000009', 4), -- PostgreSQL
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000010', 3); -- Node.js

-- Full-Stack Developer
INSERT INTO role_requirements (role_id, skill_id, importance) VALUES
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 4),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 5),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 5),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000006', 4),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000007', 4),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000008', 5),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000009', 4);

-- Machine Learning Engineer
INSERT INTO role_requirements (role_id, skill_id, importance) VALUES
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000011', 5), -- Python
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000012', 4), -- FastAPI
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000013', 5), -- scikit-learn
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000014', 5), -- Pandas
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000008', 3), -- REST APIs

-- Data Scientist
('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000011', 5), -- Python
('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000009', 4), -- SQL
('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000027', 4), -- Data Vis
('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000016', 2), -- AWS

-- DevOps Engineer
('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000015', 5), -- Docker
('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000016', 4), -- AWS
('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000017', 4), -- Git
('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000011', 3), -- Python
('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000018', 4), -- K8s

-- Cloud Architect
('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000016', 5), -- AWS
('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000015', 4), -- Docker
('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000018', 4), -- K8s

-- Cybersecurity Analyst
('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000019', 5),
('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000011', 4),

-- Mobile App Developer
('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000031', 5),
('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', 4),

-- UI/UX Designer
('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000020', 5),
('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000021', 4),
('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 3),

-- Product Manager
('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000023', 5),
('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000022', 4),

-- Scrum Master
('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000022', 5),

-- Technical Writer
('b0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000024', 5),

-- Business Analyst
('b0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000025', 5),
('b0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000027', 4),

-- IT Support Specialist
('b0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000030', 5),

-- Blockchain Developer
('b0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000026', 5),
('b0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000002', 4),

-- Data Analyst
('b0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000009', 5),
('b0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000027', 5),

-- QA Engineer
('b0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000028', 5),

-- Digital Marketing Specialist
('b0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000029', 5);

-- Insert Learning Resources
INSERT INTO learning_resources (skill_id, title, platform, url, duration, cost) VALUES
('a0000000-0000-0000-0000-000000000001', 'HTML & CSS Full Course for Beginners', 'YouTube', 'https://www.youtube.com/watch?v=mU6anWqZJcc', '6 hrs', 'Free'),
('a0000000-0000-0000-0000-000000000001', 'Web Design for Beginners', 'Udemy', 'https://www.udemy.com/course/web-design-for-beginners-real-world-coding-in-html-css/', '11 hrs', 'Paid'),
('a0000000-0000-0000-0000-000000000002', 'JavaScript Complete Course 2026', 'YouTube', 'https://www.youtube.com/watch?v=ajdRvxD8kTo', '12 hrs', 'Free'),
('a0000000-0000-0000-0000-000000000003', 'React JS crash course - Programming with Mosh', 'YouTube', 'https://www.youtube.com/watch?v=SqcY0GlETPk', '2 hrs', 'Free'),
('a0000000-0000-0000-0000-000000000004', 'TypeScript Official Documentation handbook', 'Official Docs', 'https://www.typescriptlang.org/docs/', 'N/A', 'Free');

-- Insert Sample User (Savan Chauhan) — password is "password123"
INSERT INTO users (id, name, email, password_hash, level, xp, streak, is_admin, tokens) VALUES
('c0000000-0000-0000-0000-000000000001', 'Savan Chauhan', 'savan@guild.com', '$2a$11$K1rSbKxqJOu8VJdLqEXVYOWQ4lDn5X0zHfJfGnXPcEaCBf2Kd5g7u', 7, 2450, 7, TRUE, 150);

-- Insert User Skills levels (matches initial state)
INSERT INTO user_skills (user_id, skill_id, level) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 2), -- HTML & CSS (Level 2)
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 1), -- JavaScript (Level 1)
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 0), -- React (Level 0)
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 0), -- TypeScript (Level 0)
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 2), -- Tailwind (Level 2)
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006', 1), -- C# (Level 1)
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000008', 1), -- REST APIs (Level 1)
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000009', 1), -- PostgreSQL (Level 1)
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000011', 2), -- Python Core (Level 2)
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000014', 1); -- Pandas (Level 1)

-- Insert Active Target Quest (Frontend Developer role for Savan)
INSERT INTO active_quests (user_id, role_id, progress_percent, is_completed) VALUES
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 72, FALSE);

-- Insert Achievements
INSERT INTO user_achievements (user_id, achievement_key) VALUES
('c0000000-0000-0000-0000-000000000001', 'first_quest'),
('c0000000-0000-0000-0000-000000000001', 'streak_3'),
('c0000000-0000-0000-0000-000000000001', 'skills_10');

-- Insert Seed Weekly Quests
INSERT INTO weekly_quests (id, title, description, end_date, reward_tokens) VALUES
('d0000000-0000-0000-0000-000000000001', 'Frontend Foundations Quiz', 'Test your knowledge on HTML, CSS, and JS basics!', CURRENT_TIMESTAMP + INTERVAL '7 days', 100);

-- Insert Questions for Weekly Quest
INSERT INTO quest_questions (id, weekly_quest_id, question_text, option_a, option_b, option_c, option_d, correct_option, points) VALUES
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'What does HTML stand for?', 'Hyper Text Markup Language', 'High Text Markup Language', 'Hyper Tabular Markup Language', 'Hyper Tech Media Language', 'A', 25),
('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'Which CSS property controls the text size?', 'font-style', 'text-size', 'font-size', 'text-style', 'C', 25),
('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'Inside which HTML element do we put JavaScript code?', '<scripting>', '<javascript>', '<js>', '<script>', 'D', 25),
('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 'How do you create a function in JavaScript?', 'function myFunction()', 'function:myFunction()', 'function = myFunction()', 'new function myFunction()', 'A', 25);

-- Insert Seed Shop Rewards (Physical Merch & Digital Benefits)
INSERT INTO redeemable_rewards (id, title, description, token_cost, image_url, reward_url) VALUES
('f0000000-0000-0000-0000-000000000001', 'Smart Career Thermal Water Bottle', 'Matte black 750ml stainless steel insulated thermal bottle with laser-engraved Smart Career Roadmap logo.', 150, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80', ''),
('f0000000-0000-0000-0000-000000000002', 'Full-Stack Developer Premium T-Shirt', '100% combed cotton heavy-weight black tee with minimal futuristic code graphic. Choose size at shipping.', 200, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80', ''),
('f0000000-0000-0000-0000-000000000003', 'Executive Matte Pen & Laptop Sticker Pack', 'Metallic gel ink rollerball pen + set of 12 waterproof tech stickers (React, Docker, C#, Python, Linux).', 80, 'https://images.unsplash.com/photo-1585336261026-6757c54e3ed7?auto=format&fit=crop&w=600&q=80', ''),
('f0000000-0000-0000-0000-000000000004', '1-on-1 Expert Resume Review Slot', 'Get a 30-minute personalized review session for your tech resume from senior engineering mentors.', 100, '', 'https://calendly.com/skillsathi-reviews/resume-critique');

-- Insert Seed Admin Audit Logs
INSERT INTO admin_audit_logs (id, admin_id, admin_name, action, details, timestamp) VALUES
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'Savan Chauhan', 'SEED_INIT', 'Seeded initial database structures and modern IT roles mapping successfully.', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'Savan Chauhan', 'QUEST_PUBLISH', 'Forged weekly challenge: Frontend Foundations Quiz containing 4 MCQ items.', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'Savan Chauhan', 'REWARD_LAUNCH', 'Added Professional Resume Review Slot and Preparation Handbook to the Reward Merchant vault.', CURRENT_TIMESTAMP - INTERVAL '15 minutes');
