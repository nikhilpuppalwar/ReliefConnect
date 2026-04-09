# ReliefConnect Backend (`server/`)

Express + MySQL + S3 backend for the Disaster Relief Volunteer Coordination System.

## Tech Stack

- Node.js 20.x (project currently runs with Node 20+)
- Express.js
- MySQL 8.x (`mysql2`)
- AWS S3 (`@aws-sdk/client-s3` v3)
- Auth: JWT + `bcryptjs`
- Uploads: `multer` memory storage
- Validation: `express-validator`

---

## 1) Setup

From repo root:

```bash
cd server
npm install
```

Create/update env file:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=disaster_relief
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=disaster-relief-bucket
```

> Important:
> - Do **not** commit real credentials.
> - Ensure the S3 bucket exists and IAM credentials have `s3:PutObject`.

---

## 2) Database Migration

### Files

- `migrations/001_init_schema.sql` - full schema
- `migrations/002_seed_demo.sql` - demo seed data

### Run with MySQL CLI

From `server/`:

```bash
mysql -u root -p < migrations/001_init_schema.sql
mysql -u root -p < migrations/002_seed_demo.sql
```

If your user is not `root`, replace with your DB user.

### What gets created

Tables:

- `users`
- `disasters`
- `disaster_media`
- `volunteers`
- `help_requests`
- `tasks`
- `resources`
- `resource_allocations`
- `certificates`

---

## 3) Run the API

```bash
npm run dev
```

Health check:

- `GET http://localhost:5000/health`

Expected:

```json
{ "success": true, "data": { "status": "ok" } }
```

---

## 4) Import Postman Collection

Collection file:

- `postman/ReliefConnect.postman_collection.json`

### Steps

1. Open Postman.
2. Click **Import**.
3. Select: `server/postman/ReliefConnect.postman_collection.json`.
4. Set collection variables:
   - `baseUrl` = `http://localhost:5000`
   - `token` = JWT from `/api/auth/login`

### Recommended quick test order

1. `Auth -> Register`
2. `Auth -> Login` (copy token)
3. Set `token` variable
4. Call protected routes (`/api/resources`, `/api/tasks`, etc.)

---

## 5) Notes on Auth & Roles

- `auth` middleware expects `Authorization: Bearer <token>`
- `role` middleware restricts routes to allowed roles:
  - `admin`
  - `volunteer`
  - `civilian`

---

## 6) Upload Behavior (S3)

Uploads are in-memory only (no disk writes), then pushed to S3:

- `disasters/`
- `requests/`
- `tasks/`
- `certificates/`

Returned S3 URL is stored in MySQL.

---

## 7) Troubleshooting

- `EADDRINUSE: 5000`
  - Another process is running on port 5000. Stop it or change `PORT`.
- `Database connection failed`
  - Verify MySQL is running and env credentials are correct.
- S3 upload errors
  - Verify bucket name/region and IAM permissions.
