# OpenSchedulr Deployment Guide

OpenSchedulr supports only free-tier or self-hosted deployment patterns.

## Render backend

1. Push the repository to GitHub.
2. Create a new Render Web Service from the repo.
3. Use [render.yaml](/d:/Project/OpenSchedulr/render.yaml) or the Dockerfile path `backend/Dockerfile`.
4. Attach a free PostgreSQL database from Neon or Supabase.
5. Set environment variables from [backend/.env.example](/d:/Project/OpenSchedulr/backend/.env.example).

## Vercel frontend

1. Import `frontend/` into Vercel.
2. Set `VITE_API_BASE_URL` and `VITE_API_ROOT`.
3. Use [vercel.json](/d:/Project/OpenSchedulr/vercel.json) for Vite-compatible output.

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
