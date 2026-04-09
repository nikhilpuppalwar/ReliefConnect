# Product Requirements Document (PRD)
# Disaster Relief Volunteer Coordination System

**Version:** 1.0.0  
**Date:** April 2026  
**Status:** Draft  
**Project Type:** Mini Assignment — Cloud Computing (AWS)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Goals & Objectives](#2-goals--objectives)
3. [Target Users](#3-target-users)
4. [Tech Stack](#4-tech-stack)
5. [AWS Architecture](#5-aws-architecture)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Module-wise Feature Breakdown](#8-module-wise-feature-breakdown)
9. [API Endpoints](#9-api-endpoints)
10. [File Upload Strategy (S3)](#10-file-upload-strategy-s3)
11. [Authentication & Authorization](#11-authentication--authorization)
12. [Project Folder Structure](#12-project-folder-structure)
13. [Deployment Plan](#13-deployment-plan)
14. [Milestones](#14-milestones)
15. [Out of Scope](#15-out-of-scope)

---

## 1. Project Overview

The **Disaster Relief Volunteer Coordination System** is a full-stack web application built to coordinate disaster relief efforts by connecting volunteers, admins, and affected civilians on a single platform.

The system allows civilians to report disasters and request help, admins to manage volunteers and resources, and volunteers to receive task assignments — all in real time.

This project is built and deployed on **AWS** using **EC2**, **S3**, and **MySQL**, demonstrating real-world cloud application architecture.

---

## 2. Goals & Objectives

| Goal | Description |
|------|-------------|
| Cloud Deployment | Deploy full-stack app on AWS EC2 |
| File Storage | Store all media (images, docs) on AWS S3 |
| Database | Persist all application data in MySQL |
| Role-Based System | Support Admin, Volunteer, and Civilian roles |
| Real-world Use Case | Solve a genuine social problem with technology |

---

## 3. Target Users

### 3.1 Admin
- Manages the entire platform
- Assigns volunteers to disaster zones
- Oversees resources and help requests
- Monitors all system activity via dashboard

### 3.2 Volunteer
- Registers with skills and availability
- Receives task assignments
- Updates task progress
- Uploads completion proofs

### 3.3 Affected Civilian
- Reports disaster incidents
- Submits SOS / help requests
- Tracks status of their request
- Uploads photos of affected area

---

## 4. Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React.js | 18.x | SPA UI framework |
| React Router DOM | 6.x | Client-side routing |
| Axios | 1.x | HTTP API calls |
| Tailwind CSS | 3.x | Utility-first styling |
| React Icons | 5.x | Icon components |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20.x LTS | Runtime environment |
| Express.js | 4.x | REST API framework |
| Multer | 1.x | File upload middleware |
| AWS SDK v3 | 3.x | S3 file operations |
| JWT | 9.x | Authentication tokens |
| bcryptjs | 2.x | Password hashing |
| CORS | 2.x | Cross-origin requests |
| dotenv | 16.x | Environment variables |
| mysql2 | 3.x | MySQL database driver |

### Database
| Technology | Version | Purpose |
|---|---|---|
| MySQL | 8.x | Relational data storage |

### DevOps & Deployment
| Tool | Purpose |
|---|---|
| AWS EC2 (Amazon Linux 2) | Hosting Node.js API + React build |
| AWS S3 | Storing images, videos, documents |
| AWS IAM Role | EC2 permissions to access S3 |
| Nginx | Serve React build + reverse proxy to API |
| PM2 | Keep Node.js process alive on EC2 |
| Git & GitHub | Version control |

---

## 5. AWS Architecture

```
┌──────────────────────────────────────────────────────┐
│                    User Browser                       │
└────────────────────┬─────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼─────────────────────────────────┐
│              AWS EC2 Instance                         │
│  ┌────────────────────────────────────────────────┐  │
│  │                  Nginx                          │  │
│  │   /          → React Build (dist/)              │  │
│  │   /api/*     → Node.js API (port 5000)          │  │
│  └────────────────────────────────────────────────┘  │
│  ┌──────────────────┐   ┌──────────────────────────┐ │
│  │  React.js Build  │   │  Express.js (PM2)         │ │
│  │  (Static Files)  │   │  Port: 5000               │ │
│  └──────────────────┘   └──────────┬───────────────┘ │
└──────────────────────────────────┬─┼─────────────────┘
                                   │ │
          ┌────────────────────────┘ │
          │                          │
┌─────────▼────────┐    ┌────────────▼──────────────────┐
│   AWS S3 Bucket  │    │   MySQL Database (on EC2)      │
│                  │    │                                 │
│  /uploads/       │    │  users, disasters, volunteers  │
│    avatars/      │    │  tasks, resources, requests    │
│    disasters/    │    │  certificates                  │
│    requests/     │    │                                │
│    certificates/ │    └────────────────────────────────┘
└──────────────────┘
```

### Security Groups (EC2 Firewall Rules)

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 22 | TCP | Your IP | SSH Access |
| 80 | TCP | 0.0.0.0/0 | HTTP |
| 443 | TCP | 0.0.0.0/0 | HTTPS |
| 5000 | TCP | localhost | Node.js API (internal) |
| 3306 | TCP | localhost | MySQL (internal only) |

---

## 6. Functional Requirements

### FR-01: User Authentication
- Users can register with name, email, password, and role
- Users can log in and receive a JWT token
- Passwords must be hashed using bcrypt
- JWT token expires in 24 hours

### FR-02: Disaster Reporting
- Civilians can report a disaster with type, location, severity, and description
- Photos and videos can be uploaded to S3
- Disaster status can be: Active, Under Control, Resolved

### FR-03: Volunteer Management
- Volunteers register with skills, location, and availability
- Admins can assign volunteers to disasters or help requests
- Volunteers can toggle availability status

### FR-04: Help / SOS Request
- Civilians can submit SOS requests with description and location
- Photo evidence can be uploaded to S3
- Admins assign volunteers to handle requests

### FR-05: Resource Management
- Admin can add/manage available resources (Food, Medicine, Shelter, etc.)
- Resources can be allocated to specific disaster zones
- Track quantity available vs. utilized

### FR-06: Task Assignment
- Admin creates tasks linked to a disaster and assigns to a volunteer
- Volunteers view their task list and update status
- Upload completion proof (photo) to S3

### FR-07: Admin Dashboard
- Summary cards: active disasters, volunteers, open SOS requests
- Tables: all users, all disasters, pending tasks
- Manage / delete / update any entity

### FR-08: Certificate Management
- Admin uploads participation certificates (PDF/image) to S3
- Volunteers can view and download their certificates

---

## 7. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | API response time < 500ms for standard requests |
| Scalability | App should work on EC2 t2.micro for demo purposes |
| Security | Passwords hashed, JWT auth, no exposed AWS keys |
| Availability | PM2 ensures Node.js restarts on crash |
| File Storage | All media stored in S3, not on EC2 disk |
| Portability | `.env` file for all secrets and config |
| Code Quality | Separate routes, controllers, config folders |

---

## 8. Module-wise Feature Breakdown

### Module 1: Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me (protected)

### Module 2: Disasters
- GET /api/disasters — list all
- POST /api/disasters — report new (with S3 image upload)
- PUT /api/disasters/:id — update status
- DELETE /api/disasters/:id — admin only

### Module 3: Volunteers
- GET /api/volunteers — list all
- PUT /api/volunteers/:id/availability — toggle
- GET /api/volunteers/:id/tasks — my tasks

### Module 4: Help Requests
- GET /api/requests — all SOS requests
- POST /api/requests — submit new (with S3 photo)
- PUT /api/requests/:id/assign — assign volunteer

### Module 5: Resources
- GET /api/resources
- POST /api/resources — add resource
- PUT /api/resources/:id — update quantity

### Module 6: Tasks
- GET /api/tasks — all tasks
- POST /api/tasks — create + assign
- PUT /api/tasks/:id/status — update progress

### Module 7: Certificates
- POST /api/certificates — upload to S3
- GET /api/certificates/:volunteerId — list certificates

---

## 9. API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login & get JWT |
| GET | /api/auth/me | Private | Get current user |

### Disasters
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/disasters | Public | Get all disasters |
| POST | /api/disasters | Civilian/Admin | Report disaster + upload image |
| PUT | /api/disasters/:id | Admin | Update status |
| DELETE | /api/disasters/:id | Admin | Delete |

### Volunteers
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/volunteers | Admin | All volunteers |
| PUT | /api/volunteers/:id | Volunteer | Toggle availability |

### Help Requests
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/requests | Admin | All SOS requests |
| POST | /api/requests | Civilian | Submit SOS + photo |
| PUT | /api/requests/:id/assign | Admin | Assign volunteer |

### Resources
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/resources | All | List resources |
| POST | /api/resources | Admin | Add resource |
| PUT | /api/resources/:id | Admin | Update quantity |

### Tasks
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/tasks/me | Volunteer | My assigned tasks |
| POST | /api/tasks | Admin | Create + assign task |
| PUT | /api/tasks/:id/status | Volunteer | Update status |

### Certificates
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/certificates | Admin | Upload certificate to S3 |
| GET | /api/certificates/:vid | Volunteer | Get my certificates |

---

## 10. File Upload Strategy (S3)

### S3 Bucket Structure
```
disaster-relief-bucket/
├── avatars/           → user profile photos
├── disasters/         → disaster scene images/videos
├── requests/          → SOS request photos
├── tasks/             → task completion proof photos
└── certificates/      → volunteer participation certificates
```

### Upload Flow
1. Client selects file → sends multipart/form-data to API
2. API uses Multer (memory storage) to receive file buffer
3. AWS SDK v3 `PutObjectCommand` uploads buffer to S3
4. S3 returns object URL → stored in MySQL
5. Frontend uses URL to render image/download file

### S3 Bucket Policy
- Public read for images (disasters, requests)
- Private read for certificates (signed URL on demand)
- EC2 IAM Role grants `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`

---

## 11. Authentication & Authorization

### JWT Flow
```
Login → Server issues JWT → Client stores in localStorage
→ Each request sends Authorization: Bearer <token>
→ Server middleware verifies token → attaches user to req
```

### Role-Based Access Control (RBAC)

| Route Type | Roles Allowed |
|---|---|
| Public routes | Anyone |
| Civilian routes | civilian, admin |
| Volunteer routes | volunteer, admin |
| Admin-only routes | admin |

### Middleware Stack
```
Request → authMiddleware (verify JWT) → roleMiddleware (check role) → Controller
```

---

## 12. Project Folder Structure

```
disaster-relief/
├── client/                          # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── api/                     # Axios instances
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── DisasterCard.jsx
│   │   │   └── TaskCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # JWT + user state
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Disasters.jsx
│   │   │   ├── HelpRequests.jsx
│   │   │   ├── Volunteers.jsx
│   │   │   ├── Resources.jsx
│   │   │   ├── Tasks.jsx
│   │   │   └── Certificates.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                          # Node.js + Express Backend
│   ├── config/
│   │   ├── db.js                    # MySQL connection
│   │   └── s3.js                    # AWS S3 client setup
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   └── role.js                  # RBAC middleware
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── disaster.routes.js
│   │   ├── volunteer.routes.js
│   │   ├── request.routes.js
│   │   ├── resource.routes.js
│   │   ├── task.routes.js
│   │   └── certificate.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── disaster.controller.js
│   │   ├── volunteer.controller.js
│   │   ├── request.controller.js
│   │   ├── resource.controller.js
│   │   ├── task.controller.js
│   │   └── certificate.controller.js
│   ├── uploads/                     # Temp multer storage (memory)
│   ├── .env
│   ├── index.js
│   └── package.json
│
└── README.md
```

---

## 13. Deployment Plan

### Step 1: Launch EC2 Instance
- AMI: Amazon Linux 2
- Instance type: t2.micro (free tier)
- Security group: open ports 22, 80, 443

### Step 2: Install Dependencies on EC2
```bash
sudo yum update -y
sudo yum install -y nodejs npm mysql git nginx
npm install -g pm2
```

### Step 3: Setup MySQL
```bash
sudo systemctl start mysqld
mysql -u root -p
CREATE DATABASE disaster_relief;
```

### Step 4: Clone & Configure App
```bash
git clone https://github.com/your-repo/disaster-relief.git
cd disaster-relief/server
cp .env.example .env    # fill in DB and AWS credentials
npm install
```

### Step 5: Build React Frontend
```bash
cd ../client
npm install
npm run build
```

### Step 6: Configure Nginx
```nginx
server {
  listen 80;
  location / {
    root /home/ec2-user/disaster-relief/client/dist;
    try_files $uri /index.html;
  }
  location /api {
    proxy_pass http://localhost:5000;
  }
}
```

### Step 7: Start with PM2
```bash
cd /home/ec2-user/disaster-relief/server
pm2 start index.js --name disaster-relief-api
pm2 save
pm2 startup
```

### Step 8: Setup S3 Bucket
- Create bucket: `disaster-relief-bucket`
- Enable public read for images
- Attach IAM role to EC2 with S3 permissions

---

## 14. Milestones

| Milestone | Deliverable | Timeline |
|---|---|---|
| M1 | DB schema + backend setup | Day 1–2 |
| M2 | Auth module (register/login/JWT) | Day 2–3 |
| M3 | Disaster + SOS module with S3 | Day 3–4 |
| M4 | Volunteer + Task + Resource module | Day 4–5 |
| M5 | React frontend (all pages) | Day 5–7 |
| M6 | Admin dashboard | Day 7–8 |
| M7 | EC2 deployment + Nginx + PM2 | Day 8–9 |
| M8 | Testing + final documentation | Day 9–10 |

---

## 15. Out of Scope

- Real-time chat / notifications (WebSockets)
- Mobile app (iOS / Android)
- Payment or donation gateway
- SMS/Email alert system
- Map integration (Google Maps)
- Multi-language support

---

*Document prepared for Cloud Computing Mini Assignment*  
*AWS Services Used: EC2 · S3 · MySQL*
