docker compose down -v
docker rmi -f tabungan-vite_backend tabungan-vite_frontend
docker compose up -d --build
docker inspect tabungan_frontend | grep VITE_API_URL
docker compose logs frontend | grep "API Config"
docker exec tabungan_frontend grep -r "api-tabungan" dist/ | head -5
This fix summary has been retired; core conclusions and instructions are now included in `README.md`.

If you need the full granular record, restore this file from git history.
#### 1. Created `frontend/src/config/api.ts`
