<div align="center">

# ⚡ ResumeForge

### AI-Powered Resume Builder with ATS Score Breakdown

[![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-black?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)]()

**Built by [Mohamedjasick](https://github.com/Mohamedjasick)**

---

### 🌐 Live Demo

**[resumeforge-hmj.vercel.app](https://resumeforge-hmj.vercel.app)**

| Service | URL |
|---------|-----|
| Frontend | [resumeforge-hmj.vercel.app](https://resumeforge-hmj.vercel.app) |
| Backend API | [resumeforge-backend-5754.onrender.com](https://resumeforge-backend-5754.onrender.com) |

> ⚠️ Backend is hosted on Render free tier — it may take **50+ seconds** to wake up on first request.

---

</div>

## What is ResumeForge?

ResumeForge is a full-stack AI-powered resume builder that tailors your resume to any job description and gives you a detailed ATS (Applicant Tracking System) score breakdown — so you know exactly how well your profile matches a role before you apply.

Paste a job description, get a tailored resume with a score out of 100, see which sections are weak, download as PDF or DOCX, and track all your versions — all in one place.

---

## Features

- **ATS Score Breakdown** — Visual breakdown across Skills (40), Experience (25), Projects (30), and Summary (5) with per-section progress bars and improvement hints
- **Smart Keyword Matching** — Extracts tech keywords from JDs using a curated allowlist with synonym normalization — no noise, no false matches
- **Accurate Missing Skills Detection** — Only flags skills truly absent from your entire resume, not just your skills list
- **Resume Generation** — Automatically ranks and selects your most relevant experiences and projects for each JD
- **PDF & DOCX Export** — Clean, professional resume export in both formats
- **Font Picker** — Choose from 6 professional fonts applied to your exported resume
- **Version History** — Every generated resume is saved with its ATS score and can be re-downloaded anytime
- **Multi-theme UI** — Dark, Warm & Soft, and System themes
- **Session Persistence** — Your last JD and generated result are restored when you navigate back

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Axios |
| Backend | Java 17, Spring Boot 3, Spring Security |
| Auth | JWT (JSON Web Tokens) |
| Database | MySQL 8, Spring Data JPA, Hibernate |
| PDF Export | iText 7 |
| DOCX Export | Apache POI |
| Build Tool | Maven |
| Frontend Hosting | Vercel |
| Backend Hosting | Render (Docker) |
| Database Hosting | Clever Cloud (MySQL DEV) |

---

## Project Structure

```
ResumeForge/
├── backend/                          # Spring Boot REST API
│   ├── Dockerfile                    # Multi-stage Maven + Java 17 build
│   └── src/main/java/com/resumeforge/backend/
│       ├── controller/               # REST endpoints
│       ├── service/                  # Business logic
│       │   ├── ScoringService.java   # ATS scoring & breakdown
│       │   ├── ResumeGenerationService.java
│       │   └── ResumeExportService.java
│       ├── entity/                   # JPA entities
│       ├── repository/               # Spring Data repositories
│       ├── dto/                      # Request & response DTOs
│       ├── config/                   # CORS configuration
│       ├── security/                 # JWT filter & util
│       └── util/
│           ├── JdParser.java         # JD keyword extraction
│           └── KeywordNormalizer.java # Synonym mapping
│
└── resumeforge/                      # React frontend (Vite)
    └── src/
        ├── pages/                    # Generate, Skills, Experience, etc.
        ├── components/               # Layout, Sidebar, ScoreBar, Toast
        ├── contexts/                 # ThemeContext
        └── api/                      # Axios instance
```

---

## Getting Started (Local Development)

### Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8+
- Maven

### Backend Setup

```bash
cd backend
```

Create your database:
```sql
CREATE DATABASE resumeforge;
```

Configure `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/resumeforge
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password
spring.jpa.hibernate.ddl-auto=update
jwt.secret=your_jwt_secret_key
jwt.expiration=86400000
```

Run:
```bash
mvnw clean spring-boot:run
```

Backend runs at `http://localhost:8080`

### Frontend Setup

```bash
cd resumeforge
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Production Deployment

### Backend — Render (Docker)

The backend is deployed on Render using Docker. Set these environment variables in Render:

| Variable | Description |
|----------|-------------|
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://<host>:<port>/<db>?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC` |
| `SPRING_DATASOURCE_USERNAME` | Your MySQL username |
| `SPRING_DATASOURCE_PASSWORD` | Your MySQL password |
| `JWT_SECRET` | A long random secret string |

### Frontend — Vercel

Set this environment variable in Vercel:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://resumeforge-backend-5754.onrender.com` |

- **Root Directory:** `resumeforge`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Database — Clever Cloud MySQL (Free DEV plan)

The production database is hosted on [Clever Cloud](https://clever-cloud.com) using their free MySQL DEV plan. Create an add-on and use the provided credentials in your Render environment variables.

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET/POST | `/api/skills` | Manage user skills |
| GET/POST | `/api/experiences` | Manage experience entries |
| GET/POST | `/api/projects` | Manage projects |
| GET/POST | `/api/summaries` | Manage summary variants |
| POST | `/api/resume/generate` | Generate tailored resume + ATS score |
| GET | `/api/resume/export/pdf/{id}` | Export resume as PDF |
| GET | `/api/resume/export/docx/{id}` | Export resume as DOCX |
| GET | `/api/resume/versions` | Get all saved resume versions |
| POST | `/api/ats/score` | Get ATS score for a JD |

---

## How ATS Scoring Works

The ATS score is calculated out of 100 across 4 sections:

| Section | Max Score | How it's calculated |
|---------|-----------|---------------------|
| Skills | 40 | % of your formal skills that match JD keywords |
| Projects | 30 | Relevance score of your best-matching project |
| Experience | 25 | Relevance score of your best-matching experience |
| Summary | 5 | Keyword match of your selected summary |

**Missing Skills logic:** A keyword is only flagged as missing if it does not appear anywhere in your resume — skills list, experience descriptions, project descriptions, or summary. This prevents false positives where skills you clearly know get wrongly flagged.

---

## Future Work

- [ ] Cover letter generator using the same JD input
- [ ] Resume templates — switch between layouts before export
- [ ] Job tracker — save jobs you've applied to with the generated resume
- [ ] Dashboard analytics — ATS score trends over time
- [ ] AI-powered summary generator
- [ ] LinkedIn profile import
- [ ] Mobile app (React Native)

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Made with ❤️ by [Mohamedjasick](https://github.com/Mohamedjasick)

*Star ⭐ this repo if you found it useful!*

</div>