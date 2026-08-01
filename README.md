# 🚀 SkillForge — AI-Powered Learning & Career Platform

A full-stack Final Year Project: an LMS + job marketplace + community forum + AI mentor, built with the **MERN stack** (React, Express, MongoDB) plus a modern 3D/light UI.

> **Demo credentials** (created by the seed script, password for all: `Password@123`)
>
> | Role | Email |
> |---|---|
> | Admin | `admin@skillforge.dev` |
> | Instructor | `ayesha@skillforge.dev`, `bilal@skillforge.dev`, `sana@skillforge.dev`, `usman@skillforge.dev` |
> | Student | `hassan@example.com`, `fatima@example.com`, `ali@example.com`, `zainab@example.com`, `omar@example.com`, `mahnoor@example.com`, `daniyal@example.com`, `areeba@example.com` |

---

## ✨ Features

### Students
- Browse/search/filter courses (category, level, price, rating, sort), live course search from navbar
- Enroll (demo payment), watch lessons, mark lessons complete, live progress bar
- **Certificates** — auto-issued on 100% completion, shareable/verifiable via public link (`/certificates/:code`)
- Reviews & ratings per course (edit/delete own)
- Job board: search, filters, save/bookmark jobs, apply with resume (uploaded to profile or per application)
- Track applications, saved jobs, certificates, notifications in a personal dashboard
- **Forge AI mentor** — floating chat assistant with quick prompts

### Instructors
- Create/edit courses (sections + lessons + video links, draft/publish lifecycle)
- Dashboard with stats, enrollment/revenue charts (Recharts), rating distribution, popular courses
- See enrolled students per course with progress

### Admin
- Platform-wide stats + analytics (enrollments, revenue, top courses, rating distribution)
- Moderation: users (role/active toggle), courses (publish/feature), jobs, forum posts, reviews

### Community
- Forum: questions, up/down votes, replies, accepted answers, tags, search, sorting
- Notifications (bell with unread badge, polling) for enrollments, certificates, forum activity, etc.

### AI (optional)
- `OPENAI_API_KEY` in `backend/.env` → chat endpoint answers with OpenAI (`gpt-4o-mini` default)
- Without a key, the AI mentor falls back to smart rule-based responses — everything still works offline

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3, Framer Motion, Three.js (React Three Fiber), Recharts, Axios, react-router 6 |
| Backend | Node.js, Express, Mongoose (MongoDB), JWT (access + refresh), CSRF double-submit, Helmet, express-rate-limit, sanitize-html, bcryptjs, Multer, Nodemailer |
| Security | httpOnly cookies, refresh rotation, brute-force limits, input sanitization, CORS whitelist, XSS-safe rendering (DOMPurify on client) |
| UI theme | **Light theme only** — soft gray + indigo/teal brand, glassmorphism, 3D hero, micro-interactions |

---

## 📁 Project Structure

```
skillforge/
├── backend/
│   ├── src/
│   │   ├── config/        # DB, env
│   │   ├── controllers/   # auth, users, courses, enrollments, reviews, jobs, applications, forum, notifications, chat, search, instructor, admin
│   │   ├── middleware/    # auth (JWT), upload, validate, rate limiters, error handler
│   │   ├── models/        # User, Course, Enrollment, Certificate, Review, Job, JobApplication, ForumPost/Comment, Notification, ChatMessage, RefreshToken
│   │   ├── routes/        # API route definitions
│   │   ├── seed/          # seed.js (demo data)
│   │   └── utils/         # ApiError, sanitize, helpers, notifications, emailer
│   ├── .env.example
│   └── server.js          # entry point
├── frontend/
│   ├── src/
│   │   ├── api/           # axios client + CSRF + auto token refresh
│   │   ├── components/    # ui kit, layout, navbar, home, courses, jobs, forum, chat
│   │   ├── context/       # Auth, Notifications, Chat
│   │   ├── hooks/         # useDebounce
│   │   ├── pages/         # all routes
│   │   └── utils/         # format, constants, csrf
│   └── vite.config.js     # dev proxy /api → :5000
└── package.json           # root scripts (concurrently)
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js **18+** (tested on 24)
- MongoDB running locally on `mongodb://127.0.0.1:27017` (or set `MONGODB_URI`)

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure backend env

```bash
copy backend\.env.example backend\.env   # Windows
# or: cp backend/.env.example backend/.env
```

Edit `backend/.env` and set **real random secrets** (the app refuses `change-me` placeholders):

```
JWT_ACCESS_SECRET=<64+ random hex chars>
JWT_REFRESH_SECRET=<64+ random hex chars>
CSRF_SECRET=<32+ random hex chars>
OPENAI_API_KEY=            # optional — enables real AI chat
```

### 3. Seed demo data (optional but recommended)

```bash
npm run seed:wipe     # clears + recreates demo users, courses, jobs, forum, enrollments
```

### 4. Run

```bash
npm run dev           # backend :5000 + frontend :5173 (concurrently)
```

- Frontend: **http://localhost:5173**
- Backend: **http://localhost:5000/api/health**
- Production: `npm run build` then `npm start`

---

## 🔐 Notes on Email (demo mode)

Emails (verification / password reset) are **not actually sent** in development. The API returns demo tokens that the UI surfaces as clickable links:
- Register → "Demo link" shown on the verify-email page
- Forgot password → `devResetToken` shown on the reset page

---

## ✅ Feature Checklist (functional requirements)

- [x] Register / login / logout / refresh / email verification / forgot & reset password / change password
- [x] Role-based access (student / instructor / admin) + route guards
- [x] Course catalog with search, filters, sort, pagination
- [x] Enroll, lesson progress, auto-certificate with public verification
- [x] Reviews & ratings with distribution chart
- [x] Job board: search, filters, save, apply (resume upload), status tracking
- [x] Forum: posts, tags, votes, replies, accepted answers, admin moderation
- [x] Dashboards: student / instructor / admin with analytics charts
- [x] Profiles: avatar, resume, skills, socials; public instructor profiles
- [x] Global search (courses / jobs / forum / instructors)
- [x] Notifications (bell, unread count, polling)
- [x] AI mentor chat (OpenAI-backed or rule-based fallback)
- [x] Responsive light theme, scroll animations, 3D hero, page transitions

## 🛡 Non-Functional Requirements

- Passwords hashed (bcrypt, cost 12); JWT secrets only in `.env`
- httpOnly refresh cookie, access cookie path-scoped, CSRF double-submit header
- Helmet headers, rate limiting on auth & uploads, input sanitization (server + client)
- Semantic HTML, alt texts, ARIA labels, keyboard-accessible controls
- Lazy-loaded chunks (three.js, recharts, framer-motion split from app code)
