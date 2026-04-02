# OpenSchedulr Deployment Guide

OpenSchedulr supports only free-tier or self-hosted deployment patterns.

## Easiest deploy path

Use this combination if you want the least friction:

1. Backend on Render
2. Database on Neon
3. Frontend on Vercel

## Render backend

1. Push the repository to GitHub.
2. Create a new Render Web Service from the repo.
3. Use [render.yaml](/d:/Project/OpenSchedulr/render.yaml).
4. Render should detect:
   `rootDir=backend`
   `dockerfilePath=./Dockerfile`
5. Attach a free PostgreSQL database from Neon or Supabase.
6. Set these environment variables:

```env
SPRING_PROFILES_ACTIVE=postgres
PGHOST=<your-neon-host>
PGDATABASE=OpenSchedulr
PGUSER=<your-user>
PGPASSWORD=<your-password>
PGSSLMODE=require
PGCHANNELBINDING=require
JWT_SECRET=<your-secret>
```

7. Health check path:
   `/api/actuator/health`

## Vercel frontend

### Option A: deploy repo root directly

1. Import the whole repository into Vercel.
2. Vercel will use the root [vercel.json](/d:/Project/OpenSchedulr/vercel.json).
3. Set:

```env
VITE_API_BASE_URL=https://<your-render-backend>/api
VITE_API_ROOT=https://<your-render-backend>/api
```

### Option B: deploy only `frontend/`

1. In Vercel, set the root directory to `frontend`
2. Vercel will use [frontend/vercel.json](/d:/Project/OpenSchedulr/frontend/vercel.json)
3. Set the same `VITE_API_*` variables

## Common deployment mistakes

- Deploying the repo root to Vercel without a root `vercel.json`
- Forgetting that Vite needs `VITE_*` env vars at build time
- Using Neon credentials without enabling `SPRING_PROFILES_ACTIVE=postgres`
- Supplying only raw `PG*` values to older app config that expects `DB_URL`
- Not setting the Render health check path to `/api/actuator/health`
- Forgetting to rotate secrets after testing

## Quick platform checklist

### Render

- Repo connected
- Root directory: `backend`
- Dockerfile: `./Dockerfile`
- Health path: `/api/actuator/health`
- Env vars set

### Vercel

- Either deploy root repo or `frontend/`
- `VITE_API_BASE_URL` set
- `VITE_API_ROOT` set
- Build succeeds with production API URL

### Neon

- Database exists
- Host, database, user, password copied correctly
- SSL mode required

## Local Docker

Use [docker-compose.yml](/d:/Project/OpenSchedulr/infra/docker/docker-compose.yml):

```bash
cd infra/docker
docker compose up --build
```

## Production hardening checklist

- Replace the default JWT secret.
- Restrict CORS to known frontend domains.
- Point Flyway to PostgreSQL instead of the demo H2 profile.
- Add persistent object storage only if your institution later needs file uploads.
- Add rate limiting and reverse-proxy TLS termination.

Prepared for Anish-Kumar and any institution that wants an open, cost-controlled deployment path.
