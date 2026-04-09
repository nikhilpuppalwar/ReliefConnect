CREATE DATABASE IF NOT EXISTS disaster_relief;
USE disaster_relief;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('civilian', 'volunteer', 'admin') NOT NULL DEFAULT 'civilian',
  phone VARCHAR(40) NULL,
  location VARCHAR(255) NULL,
  avatar_url TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS disasters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(80) NOT NULL,
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'high',
  location VARCHAR(255),
  status ENUM('active', 'monitoring', 'resolved') DEFAULT 'active',
  reported_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_disasters_reported_by FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS disaster_media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  disaster_id INT NOT NULL,
  media_url TEXT NOT NULL,
  media_type VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_disaster_media_disaster FOREIGN KEY (disaster_id) REFERENCES disasters(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS volunteers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  skills TEXT NULL,
  experience_years INT NOT NULL DEFAULT 0,
  zone VARCHAR(120) NULL,
  availability_status ENUM('available', 'busy', 'offline') DEFAULT 'available',
  verified TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_volunteers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS help_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  volunteer_id INT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'high',
  status ENUM('pending', 'assigned', 'in_progress', 'resolved', 'cancelled') DEFAULT 'pending',
  media_url TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_help_requests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_help_requests_volunteer FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  disaster_id INT NOT NULL,
  volunteer_id INT NOT NULL,
  due_date DATETIME NULL,
  status ENUM('assigned', 'in_progress', 'completed', 'cancelled') DEFAULT 'assigned',
  proof_url TEXT NULL,
  created_by INT NOT NULL,
  completed_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tasks_disaster FOREIGN KEY (disaster_id) REFERENCES disasters(id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_volunteer FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE RESTRICT,
  CONSTRAINT fk_tasks_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
  unit VARCHAR(40) NULL,
  location VARCHAR(255) NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
  submitted_by INT NULL,
  approved_by INT NULL,
  approved_at DATETIME NULL,
  rejection_reason VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_resources_submitted_by FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_resources_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS resource_allocations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resource_id INT NOT NULL,
  disaster_id INT NOT NULL,
  quantity DECIMAL(12,2) NOT NULL,
  note VARCHAR(500) NULL,
  allocated_by INT NOT NULL,
  allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_alloc_resource FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
  CONSTRAINT fk_alloc_disaster FOREIGN KEY (disaster_id) REFERENCES disasters(id) ON DELETE CASCADE,
  CONSTRAINT fk_alloc_by FOREIGN KEY (allocated_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  volunteer_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  issued_on DATETIME NOT NULL,
  certificate_url TEXT NOT NULL,
  issued_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cert_volunteer FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
  CONSTRAINT fk_cert_issued_by FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE RESTRICT
);
