-- Create database if not exists
CREATE DATABASE IF NOT EXISTS mucyo_portfolio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mucyo_portfolio;

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profile table
CREATE TABLE IF NOT EXISTS profile (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  title VARCHAR(150) NOT NULL,
  secondary VARCHAR(150) NOT NULL,
  school VARCHAR(150) NOT NULL,
  location VARCHAR(100) NOT NULL,
  tagline TEXT NOT NULL,
  sidebar_description TEXT NOT NULL,
  email VARCHAR(150) NOT NULL,
  github VARCHAR(255),
  linkedin VARCHAR(255),
  form_endpoint VARCHAR(255),
  image VARCHAR(255) DEFAULT '/mucyo.JPG',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  kind VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  technologies TEXT NOT NULL, -- comma separated or JSON
  github VARCHAR(255),
  demo VARCHAR(255),
  image VARCHAR(255),
  featured TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_name VARCHAR(100) NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  display_order INT DEFAULT 0
);

-- Education table
CREATE TABLE IF NOT EXISTS education (
  id INT AUTO_INCREMENT PRIMARY KEY,
  period VARCHAR(100) NOT NULL,
  title VARCHAR(150) NOT NULL,
  institution VARCHAR(150) NOT NULL,
  location VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  topics TEXT NOT NULL -- comma separated
);
