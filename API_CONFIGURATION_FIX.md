# Tabungan Bersama - API Configuration Fix

## ✅ MASALAH YANG DIPERBAIKI

### Root Cause Identified
File `frontend/src/api/auth.ts` memiliki hardcoded API URL ke `localhost:5000`, tidak menggunakan Vite environment variables.

### Solution Implemented

#### 1. Created `frontend/src/config/api.ts`
- Centralized API configuration file
- Reads `VITE_API_URL` from Vite environment variables (injected at build time)
- Fallback ke `http://api-tabungan.muzakie.my.id` jika tidak ada
- Debug logging untuk development mode

#### 2. Updated `frontend/src/api/auth.ts`
- Import `API_URL` dari `config/api.ts`
- Removed hardcoded `localhost:5000`

#### 3. Updated `frontend/vite.config.ts`
- Added `define` option untuk explicitly define environment variables
- Ensures `VITE_API_URL` tersedia di build time
- Fallback value: `http://api-tabungan.muzakie.my.id`

#### 4. Created `.env` Files
- `.env.local` - Development (localhost:5000)
- `.env.production` - Production (api-tabungan.muzakie.my.id)
- `.env.docker` - Docker build-time (api-tabungan.muzakie.my.id)

#### 5. Already Updated
- `docker-compose.yml` - Sudah ada build args untuk VITE_API_URL
- `frontend/Dockerfile` - Sudah proper untuk pass VITE_API_URL

## 🚀 LANGKAH SELANJUTNYA

### Local Development (Windows)
```bash
# Terminal 1: Backend
cd backend
npm run build
npm start

# Terminal 2: Frontend  
cd frontend
npm run dev
# Browser akan auto-open di http://localhost:5173
# API calls akan ke http://localhost:5000
```

### Docker Build (Production/VPS)
```bash
# Copy .env.docker ke .env
cp .env.docker .env

# Rebuild dengan environment variable yang benar
docker compose down -v
docker rmi -f tabungan-vite_backend tabungan-vite_frontend
docker compose up -d --build

# Verify build args passed correctly
docker inspect tabungan_frontend | grep VITE_API_URL
```

### Testing Checklist

#### Browser Console Testing
```javascript
// Open browser console at http://tabungan-new.muzakie.my.id:8090
console.log(import.meta.env.VITE_API_URL)
// Expected output: http://api-tabungan.muzakie.my.id

// Check network calls
// Expected: POST http://api-tabungan.muzakie.my.id/api/auth/login
```

#### Network Tab Verification
1. Open DevTools → Network tab
2. Try Login/Register
3. Verify API calls go to:
   - ✅ `http://api-tabungan.muzakie.my.id/api/...` (Production/Docker)
   - ✅ `http://localhost:5000/api/...` (Local development)
   - ❌ NOT `http://localhost:5000` (old hardcoded)

#### Docker Build Verification
```bash
# Check if environment variable injected in built files
docker compose logs frontend | grep "API Config"
# Expected: [API Config] Using base URL: http://api-tabungan.muzakie.my.id

# Inspect built JavaScript
docker exec tabungan_frontend grep -r "api-tabungan" dist/ | head -5
# Should find references to api-tabungan.muzakie.my.id in minified code
```

## 📋 FILE CHANGES SUMMARY

| File | Change | Status |
|------|--------|--------|
| `frontend/src/config/api.ts` | Created | ✅ New |
| `frontend/src/api/auth.ts` | Updated import | ✅ Modified |
| `frontend/vite.config.ts` | Added define section | ✅ Modified |
| `frontend/.env.local` | Created | ✅ New |
| `frontend/.env.production` | Created | ✅ New |
| `docker-compose.yml` | No change needed | ✅ OK |
| `frontend/Dockerfile` | No change needed | ✅ OK |
| `.env.docker` | Already has VITE_API_URL | ✅ OK |

## 🔍 ENVIRONMENT VARIABLE FLOW

### Build Time (Docker)
```
docker-compose.yml (build.args)
    ↓
VITE_API_URL=http://api-tabungan.muzakie.my.id
    ↓
frontend/Dockerfile (ARG VITE_API_URL)
    ↓
npm run build (RUN VITE_API_URL=${VITE_API_URL} npm run build)
    ↓
vite.config.ts (define section)
    ↓
import.meta.env.VITE_API_URL embedded in dist/index.js
    ↓
frontend/src/config/api.ts reads from import.meta.env
    ↓
frontend/src/api/auth.ts uses API_URL from config
```

### Runtime (Browser)
```
Browser loads dist/index.js
    ↓
config/api.ts: import.meta.env.VITE_API_URL = "http://api-tabungan.muzakie.my.id"
    ↓
API calls use correct URL
    ↓
POST http://api-tabungan.muzakie.my.id/api/auth/login ✅
```

## ⚠️ IMPORTANT NOTES

1. **Vite vs Runtime**: Vite environment variables are build-time only, NOT runtime
   - They are embedded into the compiled JavaScript during build
   - Must be set when running `npm run build`

2. **Docker Build Args**: Must be passed via `build.args` in docker-compose
   - NOT via `environment` section (that's for runtime)

3. **Development vs Production**:
   - `npm run dev` uses `.env.local` → connects to localhost:5000
   - `npm run build` uses `.env.production` → embeds api-tabungan.muzakie.my.id
   - Docker build uses `build.args` from docker-compose.yml

4. **Fallback Values**:
   - If no env var set, defaults to `http://api-tabungan.muzakie.my.id`
   - Prevents completely broken configuration

## 🎯 QUICK REFERENCE

### If API calls still go to localhost:5000 after Docker rebuild:
1. Check `.env` file: `cat .env | grep VITE_API_URL`
2. Check docker-compose read it: `docker compose config | grep VITE_API_URL`
3. Rebuild with explicit env: `VITE_API_URL=http://api-tabungan.muzakie.my.id docker compose up -d --build`
4. Verify in container: `docker exec tabungan_frontend cat dist/index.js | grep api-tabungan | head -1`

### If you need to change API URL later:
1. Update `.env` file
2. Run: `docker compose down && docker compose up -d --build`
3. Verify: Check browser console `import.meta.env.VITE_API_URL`
