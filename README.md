# OpenSchedulr

OpenSchedulr is a production-grade, fully free-to-run faculty class scheduling system for colleges and universities. It uses only open-source technologies and can be run locally, self-hosted, or deployed on free tiers.

Project documentation reference: Anish-Kumar.

## Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, Zustand, React Query
- Backend: Java 21, Spring Boot 3, Spring Security, JWT, JPA, Hibernate
- Solver: OptaPlanner
- Database: PostgreSQL for production, H2 for local quick-start
- Realtime: Spring WebSockets with STOMP
- DevOps: Docker, GitHub Actions, Render/Vercel compatible config

## What it does

- Generates conflict-free draft timetables
- Prevents faculty overlap and room overlap
- Respects room-type compatibility
- Tracks faculty workload and room utilization
- Supports manual admin rescheduling from the UI
- Pushes in-app notifications in real time
- Seeds demo data for immediate local testing

## Repository layout

- `backend/` Spring Boot modular monolith
- `frontend/` React dashboard
- `infra/docker/` local Docker Compose stack
- `docs/` deployment notes
- `.github/workflows/` free CI

## Clone the project

```bash
git clone <your-repo-url> OpenSchedulr
cd OpenSchedulr
```

If you already cloned a parent repository and this project lives inside it, just:

```bash
cd OpenSchedulr
```

## Prerequisites

Install these locally:

- Git
- Java 21
- Maven 3.9+
- Node.js 20+
- npm 10+

Optional:

- Docker Desktop
- PostgreSQL 16+
- Redis 7+

## Local quick-start

This is the fastest way to run the project without setting up PostgreSQL first.

### 1. Start the backend

Windows PowerShell:

```powershell
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
cd backend
mvn spring-boot:run
```

macOS/Linux:

```bash
export JAVA_HOME=/path/to/jdk-21
export PATH="$JAVA_HOME/bin:$PATH"
cd backend
mvn spring-boot:run
```

Backend URL:

- `http://localhost:8080/api`
- Swagger UI: `http://localhost:8080/api/docs/swagger`

The default local profile uses H2 in-memory storage and seeds sample users, faculty, courses, rooms, timeslots, and lecture demands automatically.

### 2. Start the frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- `http://localhost:5173`

## Demo credentials

- Admin: `admin@openschedulr.dev` / `Admin@123`
- Faculty 1: `faculty1@openschedulr.dev` / `Faculty@123`
- Faculty 2: `faculty2@openschedulr.dev` / `Faculty@123`

## Environment configuration

### Backend

Example file: `backend/.env.example`

Important variables:

- `SPRING_PROFILES_ACTIVE=postgres`
- `DB_URL=jdbc:postgresql://localhost:5432/openschedulr`
- `DB_USERNAME=openschedulr`
- `DB_PASSWORD=openschedulr`
- `DB_DRIVER=org.postgresql.Driver`
- `JWT_SECRET=change-me-change-me-change-me-change-me`
- `JWT_EXPIRATION_MINUTES=480`
- `REDIS_HOST=localhost`
- `REDIS_PORT=6379`

Alternative PostgreSQL variables also supported directly:

- `PGHOST`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`
- `PGSSLMODE`
- `PGCHANNELBINDING`

### Frontend

Example file: `frontend/.env.example`

Variables:

- `VITE_API_BASE_URL=http://localhost:8080/api`
- `VITE_API_ROOT=http://localhost:8080/api`

## Run with PostgreSQL locally

If you want a production-like local setup:

1. Create a PostgreSQL database named `openschedulr`
2. Create a user and password
3. Export the backend environment variables
4. Start the backend with the `postgres` profile

Windows PowerShell:

```powershell
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
$env:SPRING_PROFILES_ACTIVE="postgres"
$env:DB_URL="jdbc:postgresql://localhost:5432/openschedulr"
$env:DB_USERNAME="openschedulr"
$env:DB_PASSWORD="openschedulr"
$env:DB_DRIVER="org.postgresql.Driver"
$env:JWT_SECRET="change-me-change-me-change-me-change-me"
cd backend
mvn spring-boot:run
```

Flyway will create the schema automatically.

### Run with Neon-style variables

You can also use provider-style PostgreSQL variables directly, without manually building `DB_URL`.

Windows PowerShell:

```powershell
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
$env:SPRING_PROFILES_ACTIVE="postgres"
$env:PGHOST="your-neon-host"
$env:PGDATABASE="OpenSchedulr"
$env:PGUSER="neondb_owner"
$env:PGPASSWORD="your-password"
$env:PGSSLMODE="require"
$env:PGCHANNELBINDING="require"
$env:JWT_SECRET="change-me-change-me-change-me-change-me"
cd backend
mvn spring-boot:run
```

## Run with Docker

From the project root:

```bash
cd infra/docker
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080/api`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## How to use the app

1. Sign in as the admin user
2. Click `Generate timetable`
3. Review the conflict detector
4. Drag a scheduled lecture onto another timeslot to apply a manual override
5. Click `Publish`
6. Sign in as faculty to view personal timetable and notifications

## Guides

- Tutorial: [docs/TUTORIAL.md](/d:/Project/OpenSchedulr/docs/TUTORIAL.md)
- User flow: [docs/USER_FLOW.md](/d:/Project/OpenSchedulr/docs/USER_FLOW.md)
- Architecture and request flow: [docs/ARCHITECTURE.md](/d:/Project/OpenSchedulr/docs/ARCHITECTURE.md)
- API flow and example payloads: [docs/API_FLOW.md](/d:/Project/OpenSchedulr/docs/API_FLOW.md)
- Deployment guide: [docs/DEPLOYMENT.md](/d:/Project/OpenSchedulr/docs/DEPLOYMENT.md)

## Suggested learning path for new contributors

1. Read the stack and local quick-start sections
2. Run backend and frontend locally
3. Work through the tutorial in [docs/TUTORIAL.md](/d:/Project/OpenSchedulr/docs/TUTORIAL.md)
4. Read the architecture notes in [docs/ARCHITECTURE.md](/d:/Project/OpenSchedulr/docs/ARCHITECTURE.md)
5. Review the user behavior flow in [docs/USER_FLOW.md](/d:/Project/OpenSchedulr/docs/USER_FLOW.md)
6. Read `SchedulingService`
7. Read `ScheduleConstraintProvider`
8. Read `TimetableService`
9. Read the dashboard and timetable board in the frontend

## Testing and verification

These checks were run successfully on this machine after installing Java 21:

### Backend tests

```bash
cd backend
mvn test
```

What this verified:

- Java 21 compilation
- unit tests
- Spring Boot application context startup
- Flyway migration on local H2
- seed-data initialization

### Frontend build

```bash
cd frontend
npm install
npm run build
```

What this verified:

- TypeScript compilation
- Vite production build
- client bundle generation

## CI

GitHub Actions workflow:

- `.github/workflows/ci.yml`

It runs:

- backend Maven tests
- frontend npm build

## Free deployment options

### Option 1: Render + Vercel

- Backend on Render free tier using [render.yaml](/d:/Project/OpenSchedulr/render.yaml)
- PostgreSQL on Neon or Supabase free tier
- Frontend on Vercel free tier using either the root [vercel.json](/d:/Project/OpenSchedulr/vercel.json) or [frontend/vercel.json](/d:/Project/OpenSchedulr/frontend/vercel.json)

### Option 2: Full self-hosted Docker

- Use `infra/docker/docker-compose.yml`
- Good for local demos, labs, campus servers, and VPS deployments

### Option 3: Railway + Vercel

- Backend on Railway if free credits are available
- Frontend on Vercel

## Notes for production

- Replace the default JWT secret
- Restrict CORS to trusted frontend domains
- Switch from H2 to PostgreSQL
- Add backups for PostgreSQL
- Put the backend behind HTTPS in production
- Redis is optional and can be enabled later for caching

## Key files

- `backend/pom.xml`
- `backend/src/main/resources/application.yml`
- `backend/src/main/resources/db/migration/V1__initial_schema.sql`
- `backend/src/main/java/com/openschedulr/scheduling/service/SchedulingService.java`
- `frontend/src/pages/dashboard-page.tsx`
- `infra/docker/docker-compose.yml`
- `docs/TUTORIAL.md`
- `docs/USER_FLOW.md`
- `docs/ARCHITECTURE.md`
- `docs/API_FLOW.md`
- `docs/DEPLOYMENT.md`

## Fastest production-like deployment

1. Create a Neon PostgreSQL database
2. Deploy backend to Render using [render.yaml](/d:/Project/OpenSchedulr/render.yaml)
3. Set Render env vars:
   `SPRING_PROFILES_ACTIVE=postgres`
   `PGHOST`
   `PGDATABASE`
   `PGUSER`
   `PGPASSWORD`
   `PGSSLMODE=require`
   `PGCHANNELBINDING=require`
   `JWT_SECRET`
   `APP_SEED_DEMO_ENABLED=false`
   `APP_REALTIME_ENABLED=false`
   `BOOTSTRAP_ADMIN_ENABLED=true`
   `BOOTSTRAP_ADMIN_EMAIL=admin@openschedulr.dev`
   `BOOTSTRAP_ADMIN_PASSWORD=<change-this-password>`
4. Deploy frontend to Vercel
5. Set Vercel env vars:
   `VITE_API_BASE_URL=https://<render-backend>/api`
   `VITE_API_ROOT=https://<render-backend>/api`
