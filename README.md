# Tabungan Bersama - Shared Savings Goals Application

🎯 Aplikasi modern untuk mengelola tujuan tabungan bersama dengan fitur animasi dan design yang menarik.

## 🌟 Fitur Utama

✅ **Autentikasi & Registrasi** - Sistem login/signup dengan JWT  
✅ **Tujuan Pribadi** - Kelola tujuan tabungan individu  
# Tabungan Bersama

Ringkasan singkat dan panduan deployment untuk proyek "Tabungan Bersama".

Status saat ini
- Frontend: Vite + React (TypeScript) — built and served from Docker image
- Backend: Express (TypeScript) — Dockerized, menggunakan MySQL (external)
- Important fixes: VITE API URL is injected at build-time (via Docker build-arg) and API must be served over HTTPS in production to avoid mixed-content in browser.

Quick Start — Local Development

1. Backend (local)
```powershell
cd backend
npm install
cp .env.example .env    # set DB connection to your local MySQL
npm run build
npm run start:dev      # or npm run dev (depends on package.json)
# Backend default: http://localhost:5000
```

2. Frontend (local)
```powershell
cd frontend
npm install
cp .env.local .env     # ensures VITE_API_URL=http://localhost:5000 for dev
npm run dev
# Frontend default: http://localhost:5173 (or as vite outputs)
```

Docker Deployment (production)

1. Prepare `.env` on the server (project root). Example (important values):
```dotenv
NODE_ENV=production
DB_HOST=localhost            # or your external MySQL host
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=tabungan-vite
JWT_SECRET=your-secret
VITE_API_URL=https://api.com
BACKEND_PORT=5000
FRONTEND_PORT=8090
```

2. Build & run with Docker Compose
```bash
# On the server
cd ~/tabungan-vite
cp .env.docker .env   # or create .env as above
docker compose down -v
docker compose up -d --build
```

Notes
- Vite environment variables (prefixed `VITE_`) are embedded at build time. Make sure `VITE_API_URL` is set when running `npm run build` (the Dockerfile accepts `ARG VITE_API_URL` and docker-compose passes it via `build.args`).
- Production API must use `https://` if your frontend is served over HTTPS to avoid Mixed Content errors.

How to verify
- Frontend container healthy and serving assets: `docker ps` and `docker logs tabungan_frontend`
- Backend container should be `Up`; if it restarts inspect logs: `docker logs tabungan_backend --tail 200`
- In browser DevTools → Network, API requests should go to the `VITE_API_URL` domain (HTTPS in prod).

Troubleshooting pointers
- If frontend still calls `http://localhost:5000` after deploying:
	- Ensure you rebuilt the frontend image after updating `.env` (or passed `VITE_API_URL` as build-arg)
	- Re-run: `docker compose up -d --build`
- If you see Mixed Content errors: change `VITE_API_URL` to `https://...` and rebuild
- If backend container restarts on startup: check `DATABASE_URL`/DB credentials and network access to MySQL

Files removed
- Obsolete debug docs have been deleted from the repository to keep the repo tidy.

Contact / next steps
- If you want, I can also:
	- add a small health-check endpoint for the frontend to ensure the SPA serves correctly
	- add a simple GitHub Actions workflow to build images and push to a registry

---

Enjoy — and tell me if you want me to run a Docker rebuild or inspect the backend logs now.
