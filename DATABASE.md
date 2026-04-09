# Database Design Document
# Disaster Relief Volunteer Coordination System

**Database:** MySQL 8.x  
**Database Name:** `disaster_relief`  
**Version:** 1.0.0  
**Date:** April 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [ER Diagram (Text)](#2-er-diagram-text)
3. [Table Definitions](#3-table-definitions)
4. [Relationships Summary](#4-relationships-summary)
5. [Full SQL Script](#5-full-sql-script)
6. [Sample Seed Data](#6-sample-seed-data)
7. [Indexes](#7-indexes)
8. [Notes & Conventions](#8-notes--conventions)

---

## 1. Overview

The database contains **9 core tables** covering all entities of the system.

| Table | Description |
|-------|-------------|
| `users` | All registered users (admin, volunteer, civilian) |
| `disasters` | Reported disaster events |
| `disaster_media` | S3 image/video URLs for disaster reports |
| `help_requests` | SOS / help requests from civilians |
| `volunteers` | Extended volunteer profile info |
| `tasks` | Tasks assigned to volunteers |
| `resources` | Available relief resources |
| `resource_allocations` | Resources allocated to disaster zones |
| `certificates` | Volunteer certificates stored on S3 |

---

## 2. ER Diagram (Text)

```
users (1) ──────────── (M) disasters
users (1) ──────────── (M) help_requests
users (1) ──────────── (1) volunteers
users (1) ──────────── (M) tasks (as assigned_to)
users (1) ──────────── (M) tasks (as assigned_by)
users (1) ──────────── (M) certificates

disasters (1) ──────── (M) disaster_media
disasters (1) ──────── (M) help_requests
disasters (1) ──────── (M) tasks
disasters (1) ──────── (M) resource_allocations

resources (1) ──────── (M) resource_allocations
```

---

## 3. Table Definitions

---

### 3.1 `users`

Stores all registered users regardless of role.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique user ID |
| name | VARCHAR(100) | NOT NULL | Full name |
| email | VARCHAR(150) | NOT NULL, UNIQUE | Login email |
| password | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| role | ENUM | NOT NULL | 'admin', 'volunteer', 'civilian' |
| phone | VARCHAR(20) | NULL | Contact number |
| location | VARCHAR(200) | NULL | City / Area |
| avatar_url | TEXT | NULL | S3 URL for profile photo |
| is_active | TINYINT(1) | DEFAULT 1 | Account status |
| created_at | TIMESTAMP | DEFAULT NOW() | Registration time |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Last updated |

---

### 3.2 `disasters`

Reported disaster events submitted by civilians or admins.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique disaster ID |
| reported_by | INT | FK → users.id | Who reported it |
| title | VARCHAR(200) | NOT NULL | Short title |
| type | ENUM | NOT NULL | 'flood', 'earthquake', 'fire', 'cyclone', 'landslide', 'other' |
| description | TEXT | NOT NULL | Detailed description |
| location | VARCHAR(255) | NOT NULL | Affected location |
| latitude | DECIMAL(9,6) | NULL | GPS latitude |
| longitude | DECIMAL(9,6) | NULL | GPS longitude |
| severity | ENUM | NOT NULL | 'low', 'medium', 'high', 'critical' |
| status | ENUM | DEFAULT 'active' | 'active', 'under_control', 'resolved' |
| created_at | TIMESTAMP | DEFAULT NOW() | Report time |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Last updated |

---

### 3.3 `disaster_media`

Stores S3 URLs for images and videos attached to a disaster report.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique media ID |
| disaster_id | INT | FK → disasters.id | Associated disaster |
| file_url | TEXT | NOT NULL | Full S3 URL |
| file_type | ENUM | NOT NULL | 'image', 'video', 'document' |
| uploaded_at | TIMESTAMP | DEFAULT NOW() | Upload timestamp |

---

### 3.4 `help_requests`

SOS / help requests submitted by affected civilians.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique request ID |
| disaster_id | INT | FK → disasters.id, NULL | Related disaster (if known) |
| requested_by | INT | FK → users.id | Civilian who submitted |
| assigned_to | INT | FK → users.id, NULL | Volunteer assigned |
| description | TEXT | NOT NULL | Nature of help needed |
| location | VARCHAR(255) | NOT NULL | Location needing help |
| photo_url | TEXT | NULL | S3 URL for situation photo |
| status | ENUM | DEFAULT 'pending' | 'pending', 'assigned', 'in_progress', 'resolved' |
| priority | ENUM | DEFAULT 'medium' | 'low', 'medium', 'high', 'critical' |
| created_at | TIMESTAMP | DEFAULT NOW() | Submission time |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Last updated |

---

### 3.5 `volunteers`

Extended profile information for users with role = 'volunteer'.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique volunteer profile ID |
| user_id | INT | FK → users.id, UNIQUE | Linked user account |
| skills | VARCHAR(500) | NULL | Comma-separated skills (Medical, Rescue, Logistics, etc.) |
| experience_years | INT | DEFAULT 0 | Years of relief experience |
| availability | ENUM | DEFAULT 'available' | 'available', 'busy', 'off_duty' |
| zone | VARCHAR(200) | NULL | Preferred working zone |
| verified | TINYINT(1) | DEFAULT 0 | Admin verified volunteer |
| joined_at | TIMESTAMP | DEFAULT NOW() | Profile creation time |

---

### 3.6 `tasks`

Tasks created by admin and assigned to volunteers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique task ID |
| disaster_id | INT | FK → disasters.id | Linked disaster |
| assigned_to | INT | FK → users.id | Volunteer receiving task |
| assigned_by | INT | FK → users.id | Admin who created task |
| title | VARCHAR(200) | NOT NULL | Task title |
| description | TEXT | NOT NULL | Task details |
| category | ENUM | NOT NULL | 'rescue', 'medical', 'food', 'shelter', 'logistics', 'other' |
| status | ENUM | DEFAULT 'pending' | 'pending', 'in_progress', 'completed', 'cancelled' |
| proof_url | TEXT | NULL | S3 URL for completion proof |
| due_date | DATE | NULL | Deadline |
| completed_at | TIMESTAMP | NULL | Completion timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | Task creation time |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Last updated |

---

### 3.7 `resources`

Relief resources available in the system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique resource ID |
| name | VARCHAR(100) | NOT NULL | Resource name (e.g., "Food Packets") |
| category | ENUM | NOT NULL | 'food', 'medicine', 'shelter', 'clothing', 'equipment', 'other' |
| quantity_available | INT | DEFAULT 0 | Current stock |
| quantity_utilized | INT | DEFAULT 0 | Total used |
| unit | VARCHAR(50) | NOT NULL | Unit (kg, liters, units, boxes) |
| added_by | INT | FK → users.id | Admin who added |
| created_at | TIMESTAMP | DEFAULT NOW() | Addition time |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Last updated |

---

### 3.8 `resource_allocations`

Tracks which resources were sent to which disaster zone.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique allocation ID |
| resource_id | INT | FK → resources.id | Resource being allocated |
| disaster_id | INT | FK → disasters.id | Target disaster zone |
| allocated_by | INT | FK → users.id | Admin who allocated |
| quantity | INT | NOT NULL | Amount allocated |
| notes | TEXT | NULL | Optional remarks |
| allocated_at | TIMESTAMP | DEFAULT NOW() | Allocation time |

---

### 3.9 `certificates`

Volunteer participation certificates uploaded to S3 by admin.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique certificate ID |
| volunteer_id | INT | FK → users.id | Recipient volunteer |
| issued_by | INT | FK → users.id | Admin who uploaded |
| title | VARCHAR(200) | NOT NULL | Certificate title |
| file_url | TEXT | NOT NULL | S3 URL (PDF or image) |
| issued_date | DATE | NOT NULL | Certificate issue date |
| created_at | TIMESTAMP | DEFAULT NOW() | Upload timestamp |

---

## 4. Relationships Summary

| Relationship | Type | Description |
|---|---|---|
| users → disasters | One-to-Many | A user can report many disasters |
| users → help_requests (requested_by) | One-to-Many | A civilian can submit many requests |
| users → help_requests (assigned_to) | One-to-Many | A volunteer can be assigned many requests |
| users → volunteers | One-to-One | Each volunteer has one extended profile |
| users → tasks (assigned_to) | One-to-Many | A volunteer can have many tasks |
| users → tasks (assigned_by) | One-to-Many | An admin can create many tasks |
| users → certificates | One-to-Many | A volunteer can have many certificates |
| disasters → disaster_media | One-to-Many | A disaster can have many media files |
| disasters → help_requests | One-to-Many | A disaster can have many help requests |
| disasters → tasks | One-to-Many | A disaster can have many tasks |
| disasters → resource_allocations | One-to-Many | Resources can be allocated to a disaster |
| resources → resource_allocations | One-to-Many | One resource type can be allocated multiple times |

---

## 5. Full SQL Script

```sql
-- ============================================================
-- DATABASE: disaster_relief
-- ============================================================

CREATE DATABASE IF NOT EXISTS disaster_relief;
USE disaster_relief;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  role         ENUM('admin', 'volunteer', 'civilian') NOT NULL DEFAULT 'civilian',
  phone        VARCHAR(20) DEFAULT NULL,
  location     VARCHAR(200) DEFAULT NULL,
  avatar_url   TEXT DEFAULT NULL,
  is_active    TINYINT(1) NOT NULL DEFAULT 1,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: disasters
-- ============================================================
CREATE TABLE disasters (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  reported_by  INT NOT NULL,
  title        VARCHAR(200) NOT NULL,
  type         ENUM('flood','earthquake','fire','cyclone','landslide','other') NOT NULL,
  description  TEXT NOT NULL,
  location     VARCHAR(255) NOT NULL,
  latitude     DECIMAL(9,6) DEFAULT NULL,
  longitude    DECIMAL(9,6) DEFAULT NULL,
  severity     ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  status       ENUM('active','under_control','resolved') NOT NULL DEFAULT 'active',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: disaster_media
-- ============================================================
CREATE TABLE disaster_media (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  disaster_id  INT NOT NULL,
  file_url     TEXT NOT NULL,
  file_type    ENUM('image','video','document') NOT NULL DEFAULT 'image',
  uploaded_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (disaster_id) REFERENCES disasters(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: help_requests
-- ============================================================
CREATE TABLE help_requests (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  disaster_id   INT DEFAULT NULL,
  requested_by  INT NOT NULL,
  assigned_to   INT DEFAULT NULL,
  description   TEXT NOT NULL,
  location      VARCHAR(255) NOT NULL,
  photo_url     TEXT DEFAULT NULL,
  status        ENUM('pending','assigned','in_progress','resolved') NOT NULL DEFAULT 'pending',
  priority      ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (disaster_id)  REFERENCES disasters(id) ON DELETE SET NULL,
  FOREIGN KEY (requested_by) REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (assigned_to)  REFERENCES users(id)     ON DELETE SET NULL
);

-- ============================================================
-- TABLE: volunteers
-- ============================================================
CREATE TABLE volunteers (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL UNIQUE,
  skills           VARCHAR(500) DEFAULT NULL,
  experience_years INT DEFAULT 0,
  availability     ENUM('available','busy','off_duty') NOT NULL DEFAULT 'available',
  zone             VARCHAR(200) DEFAULT NULL,
  verified         TINYINT(1) NOT NULL DEFAULT 0,
  joined_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: tasks
-- ============================================================
CREATE TABLE tasks (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  disaster_id   INT NOT NULL,
  assigned_to   INT NOT NULL,
  assigned_by   INT NOT NULL,
  title         VARCHAR(200) NOT NULL,
  description   TEXT NOT NULL,
  category      ENUM('rescue','medical','food','shelter','logistics','other') NOT NULL,
  status        ENUM('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
  proof_url     TEXT DEFAULT NULL,
  due_date      DATE DEFAULT NULL,
  completed_at  TIMESTAMP DEFAULT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (disaster_id) REFERENCES disasters(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id)     ON DELETE CASCADE
);

-- ============================================================
-- TABLE: resources
-- ============================================================
CREATE TABLE resources (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  name                VARCHAR(100) NOT NULL,
  category            ENUM('food','medicine','shelter','clothing','equipment','other') NOT NULL,
  quantity_available  INT NOT NULL DEFAULT 0,
  quantity_utilized   INT NOT NULL DEFAULT 0,
  unit                VARCHAR(50) NOT NULL,
  added_by            INT NOT NULL,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: resource_allocations
-- ============================================================
CREATE TABLE resource_allocations (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  resource_id   INT NOT NULL,
  disaster_id   INT NOT NULL,
  allocated_by  INT NOT NULL,
  quantity      INT NOT NULL,
  notes         TEXT DEFAULT NULL,
  allocated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resource_id)  REFERENCES resources(id)  ON DELETE CASCADE,
  FOREIGN KEY (disaster_id)  REFERENCES disasters(id)  ON DELETE CASCADE,
  FOREIGN KEY (allocated_by) REFERENCES users(id)      ON DELETE CASCADE
);

-- ============================================================
-- TABLE: certificates
-- ============================================================
CREATE TABLE certificates (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  volunteer_id  INT NOT NULL,
  issued_by     INT NOT NULL,
  title         VARCHAR(200) NOT NULL,
  file_url      TEXT NOT NULL,
  issued_date   DATE NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (volunteer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (issued_by)    REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 6. Sample Seed Data

```sql
USE disaster_relief;

-- Admin User (password: Admin@123 → bcrypt hash)
INSERT INTO users (name, email, password, role, phone, location) VALUES
('System Admin', 'admin@disasterrelief.com',
 '$2b$10$abc...hashedpassword', 'admin', '9999900000', 'Mumbai'),

-- Volunteer Users
('Ravi Sharma',   'ravi@volunteer.com',
 '$2b$10$abc...hashedpassword', 'volunteer', '9876500001', 'Pune'),
('Priya Singh',   'priya@volunteer.com',
 '$2b$10$abc...hashedpassword', 'volunteer', '9876500002', 'Nagpur'),

-- Civilian Users
('Anita Patil',   'anita@civilian.com',
 '$2b$10$abc...hashedpassword', 'civilian', '9876500003', 'Kolhapur'),
('Suresh Kumar',  'suresh@civilian.com',
 '$2b$10$abc...hashedpassword', 'civilian', '9876500004', 'Nashik');

-- Volunteer Profiles
INSERT INTO volunteers (user_id, skills, experience_years, availability, zone, verified) VALUES
(2, 'Medical,Rescue,First Aid', 3, 'available', 'Western Maharashtra', 1),
(3, 'Logistics,Food Distribution', 2, 'available', 'Central Maharashtra', 1);

-- Disasters
INSERT INTO disasters (reported_by, title, type, description, location, severity, status) VALUES
(4, 'Kolhapur Flash Flood 2026', 'flood',
 'Heavy rainfall caused flash floods in low lying areas of Kolhapur city.',
 'Kolhapur, Maharashtra', 'critical', 'active'),

(5, 'Nashik Industrial Fire', 'fire',
 'Fire broke out in an industrial warehouse in MIDC area.',
 'Nashik MIDC, Maharashtra', 'high', 'under_control');

-- Help Requests
INSERT INTO help_requests (disaster_id, requested_by, description, location, status, priority) VALUES
(1, 4, 'Family of 5 stuck on rooftop, need immediate rescue.',
 'Rajarampuri, Kolhapur', 'pending', 'critical'),
(1, 5, 'Need food and clean water for 20 people.',
 'Shivaji Nagar, Kolhapur', 'pending', 'high');

-- Resources
INSERT INTO resources (name, category, quantity_available, unit, added_by) VALUES
('Food Packets',     'food',      500,  'packets',  1),
('Water Bottles',    'food',      1000, 'bottles',  1),
('First Aid Kits',   'medicine',  100,  'kits',     1),
('Tents',            'shelter',   50,   'units',    1),
('Blankets',         'clothing',  200,  'pieces',   1);

-- Tasks
INSERT INTO tasks (disaster_id, assigned_to, assigned_by, title, description, category, status) VALUES
(1, 2, 1,
 'Rescue family in Rajarampuri',
 'Proceed to Rajarampuri and rescue the family of 5 stranded on rooftop.',
 'rescue', 'pending'),

(1, 3, 1,
 'Food distribution at Shivaji Nagar',
 'Distribute food packets and water to 20+ civilians at Shivaji Nagar shelter.',
 'food', 'in_progress');
```

---

## 7. Indexes

```sql
-- Users
CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_role     ON users(role);

-- Disasters
CREATE INDEX idx_disasters_status   ON disasters(status);
CREATE INDEX idx_disasters_type     ON disasters(type);
CREATE INDEX idx_disasters_reported ON disasters(reported_by);

-- Help Requests
CREATE INDEX idx_requests_status     ON help_requests(status);
CREATE INDEX idx_requests_priority   ON help_requests(priority);
CREATE INDEX idx_requests_disaster   ON help_requests(disaster_id);
CREATE INDEX idx_requests_assigned   ON help_requests(assigned_to);

-- Tasks
CREATE INDEX idx_tasks_status      ON tasks(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_disaster    ON tasks(disaster_id);

-- Volunteers
CREATE INDEX idx_volunteers_availability ON volunteers(availability);
```

---

## 8. Notes & Conventions

| Convention | Detail |
|---|---|
| Primary Keys | All tables use `INT AUTO_INCREMENT` |
| Timestamps | `created_at` on all tables; `updated_at` where records change |
| Soft Delete | `is_active` flag on users (no hard delete for audit trail) |
| Passwords | Never stored in plain text — always bcrypt hashed before INSERT |
| S3 URLs | Stored as `TEXT` columns (URLs can be long) |
| ENUMs | Used for status fields to enforce valid values at DB level |
| Foreign Keys | All FKs defined with appropriate ON DELETE actions |
| Naming | snake_case for all table and column names |
| Character Set | Default UTF-8 (handles multilingual content) |

### S3 URL Format in DB
```
https://<bucket-name>.s3.<region>.amazonaws.com/<folder>/<filename>
Example:
https://disaster-relief-bucket.s3.ap-south-1.amazonaws.com/disasters/flood_image_001.jpg
```

---

*Database design document for Cloud Computing Mini Assignment*  
*AWS Services Used: EC2 · S3 · MySQL*
