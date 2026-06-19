# JobBoard Starter

A full-stack job board built with the MERN stack — ready to deploy or extend as a starter kit.

## Features

### Authentication
- JWT-based register/login with 7-day token expiry
- Role-based access: **candidate**, **employer**, **admin**
- Passwords hashed with bcrypt (salt rounds: 10)
- Protected routes on both frontend and backend

### Job Listings
- Browse, search, and filter jobs by title, company, location, and type
- Paginated results (9 per page)
- Public access — no login required to browse

### Applications
- Candidates apply to jobs with an optional cover letter
- Duplicate application prevention (409 response)
- Application status tracking: `pending` → `reviewed` → `hired` / `rejected`

### Dashboard
- **Candidates**: view all submitted applications with live status
- **Employers**: create/edit/delete job listings, toggle active status, view applications per job, update applicant status
- Application count per job computed via MongoDB aggregation (no N+1 queries)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v7, Vite |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Styling | CSS custom properties, no UI framework |

---

## Project Structure

```
jobboard-starter/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/   # Navbar
│       ├── context/      # AuthContext, ThemeContext
│       ├── pages/        # Home, Jobs, JobDetail, Login, Register, Dashboard, NotFound
│       └── styles/       # global.css, theme.css
└── server/          # Express API
    ├── config/      # MongoDB connection
    ├── middleware/  # auth.js (JWT), roleCheck.js
    ├── models/      # User, Job, Application
    └── routes/      # authRoutes, jobRoutes, applicationRoutes
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone the repo

```bash
git clone <repo-url>
cd jobboard-starter
```

### 2. Set up the server

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your values (see Environment Variables below)
npm run dev
```

### 3. Set up the client

```bash
cd client
npm install
npm run dev
```

The app runs at `http://localhost:5173`. API requests proxy to `http://localhost:5000`.

### 4. Production build

```bash
cd client
npm run build
# Serve the dist/ folder with any static host
```

---

## Environment Variables

Create `server/.env` from `server/.env.example`:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port the Express server listens on | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/jobboard` |
| `JWT_SECRET` | Secret key for signing JWTs — keep this long and random | `change_me_in_production` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |

---

## Roles

| Role | Capabilities |
|------|-------------|
| **candidate** | Browse jobs, apply to jobs, view own applications |
| **employer** | Create/edit/delete own job listings, view applicants, update application status |
| **admin** | Same as candidate + employer (reserved for future admin UI) |

Registration accepts `candidate` or `employer` only — `admin` cannot be self-assigned.

---

## API Overview

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register a new user |
| POST | `/api/auth/login` | — | Login, receive JWT |
| GET | `/api/auth/me` | Bearer | Get current user profile |

### Jobs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/jobs` | — | List jobs (filterable, paginated) |
| GET | `/api/jobs/:id` | — | Get single job |
| GET | `/api/jobs/my` | Employer | Get employer's own listings |
| POST | `/api/jobs` | Employer | Create a job |
| PUT | `/api/jobs/:id` | Employer | Update own job |
| DELETE | `/api/jobs/:id` | Employer | Delete own job |

### Applications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/applications` | Candidate | Apply to a job |
| GET | `/api/applications/my` | Candidate | Get own applications |
| GET | `/api/applications/job/:jobId` | Employer | Get applicants for a job |
| PUT | `/api/applications/:id/status` | Employer | Update application status |

---

## Development Scripts

**Server**
```bash
npm run dev    # nodemon (hot reload)
npm start      # node (production)
```

**Client**
```bash
npm run dev      # Vite dev server
npm run build    # Production build
npm run preview  # Preview production build locally
```

---

## Deployment

### Backend — Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your repository and set:
   - **Root directory**: `server`
   - **Build command**: `npm install`
   - **Start command**: `node index.js`
3. Add the following environment variables in Render's dashboard:

| Variable | Value |
|----------|-------|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long, random secret (generate with `openssl rand -hex 32`) |
| `CLIENT_URL` | Your Vercel frontend URL (e.g. `https://your-app.vercel.app`) |
| `PORT` | Leave unset — Render sets this automatically |

### Frontend — Vercel

1. Import your repository on [Vercel](https://vercel.com)
2. Set:
   - **Root directory**: `client`
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
3. Add the environment variable:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your Render backend URL (e.g. `https://your-api.onrender.com`) |

### Local development

Create `client/.env` (copy from `client/.env.example`):
```
VITE_API_URL=http://localhost:5000
```

The Vite dev proxy (`/api` → `http://localhost:5000`) also remains active for local dev — both approaches work simultaneously.

---

## Built With

- [React](https://react.dev/) — UI library
- [Vite](https://vitejs.dev/) — Frontend build tool
- [React Router](https://reactrouter.com/) — Client-side routing
- [Express](https://expressjs.com/) — Web framework
- [Mongoose](https://mongoosejs.com/) — MongoDB ODM
- [JSON Web Tokens](https://jwt.io/) — Authentication
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) — Password hashing
