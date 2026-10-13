-- Create tables (PostgreSQL syntax)

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profile table
CREATE TABLE IF NOT EXISTS profile (
  id SERIAL PRIMARY KEY,
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  kind VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  technologies TEXT NOT NULL DEFAULT '[]',
  github VARCHAR(255) DEFAULT '',
  demo VARCHAR(255) DEFAULT '',
  image VARCHAR(255) DEFAULT '',
  featured SMALLINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  group_name VARCHAR(100) NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  display_order INT DEFAULT 0
);

-- Education table
CREATE TABLE IF NOT EXISTS education (
  id SERIAL PRIMARY KEY,
  period VARCHAR(100) NOT NULL,
  title VARCHAR(150) NOT NULL,
  institution VARCHAR(150) NOT NULL,
  location VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  topics TEXT NOT NULL DEFAULT '[]'
);
