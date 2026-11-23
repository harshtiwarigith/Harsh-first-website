# EduLock - Educational Screen Lock & Skill Development Platform

A full-stack web app: **React (Vite)** frontend, **Node.js + Express** backend, **MySQL** database.

## Features
- Student registration, login, logout (bcrypt password hashing, JWT, role-based access)
- Educational Screen Lock: answer a question to unlock (server verifies the answer, sessions are stored)
- Skill development (Programming, Communication, Problem Solving, Technical) with progress bars
- Learning activities: search, filter, mark complete, resource links
- Progress tracking: weekly chart, learning history, lock session history
- Admin dashboard: manage students, questions and learning activities

## Requirements
Node.js 18+ and MySQL 8+.

## Setup

### 1. Database
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env
# edit .env: set DB_PASSWORD and a long random JWT_SECRET
npm run dev
```
API runs at http://localhost:5000. On first start the admin account from `.env`
(`ADMIN_EMAIL` / `ADMIN_PASSWORD`) is created automatically.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## Logins
- Admin: the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in `backend/.env`
- Student: click Register on the login page

## API overview
| Area | Endpoints |
|------|-----------|
| Auth | POST /api/auth/register, POST /api/auth/login, GET /api/auth/me |
| Student | GET /api/student/overview, /activities, /history, /weekly; POST /api/student/activities/:id/complete |
| Screen lock | POST /api/lock/start, POST /api/lock/answer, GET /api/lock/sessions |
| Admin | /api/admin/stats, /students, /questions, /activities, /subjects, /skills |

## Deployment notes
- Build frontend: `cd frontend && npm run build` (output in `frontend/dist`)
- Set `CLIENT_URL` in the backend `.env` to your deployed frontend URL
- Use a strong `JWT_SECRET`, change the default admin password, and serve over HTTPS
