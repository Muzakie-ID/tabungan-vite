# Frontend Docker Setup - Without Nginx

## Changes

### Problem
Anda sudah punya Nginx configuration sendiri, jadi tidak perlu containerize Nginx.

### Solution
Frontend Dockerfile sekarang:
1. ✅ **Build stage only** - Build aplikasi React
2. ✅ **Serve dengan `serve`** - Node.js serve package untuk simple serving
3. ✅ **Port 3000** - Expose port 3000 (frontend)
4. ❌ **Tanpa Nginx** - Anda gunakan Nginx Anda sendiri sebagai reverse proxy

## Architecture

```
┌─────────────────────────────────────────┐
│  Your Nginx (on host/VPS)              │
│  - Listen port 80/443                  │
│  - Reverse proxy frontend -> 3000      │
│  - Reverse proxy backend -> 5000       │
└─────────────────────┬───────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
    ┌───▼────┐   ┌────▼────┐  ┌────▼────┐
    │Frontend│   │ Backend │  │ MySQL   │
    │:3000   │   │ :5000   │  │ :3306   │
    │(serve) │   │(Express)│  │(external)
    └────────┘   └─────────┘  └─────────┘
    (Docker)     (Docker)     (Host/VPS)
```

## How to Use

### 1. Build
```bash
docker-compose build frontend --no-cache
```

### 2. Run
```bash
docker-compose up -d frontend
```

### 3. Configure Your Nginx

**File: /etc/nginx/sites-available/your-config**

```nginx
upstream frontend {
    server localhost:3000;
}

upstream backend {
    server localhost:5000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.yourdomain.com;

    # Backend API
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Enable & Restart Nginx
```bash
sudo ln -s /etc/nginx/sites-available/your-config /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Dockerfile Details

### Build Stage
- Copy all config files (tsconfig.json, vite.config.ts, etc)
- Install dependencies
- Build aplikasi → output ke `dist/`

### Output Stage
- Copy `dist/` dari build stage
- Install `serve` package (simple Node.js HTTP server)
- Start serve pada port 3000

### Why not Nginx in Docker?
1. ✅ Anda sudah punya Nginx di host/VPS
2. ✅ Simplify - satu nginx untuk handle semua routing
3. ✅ Centralized config - mudah manage SSL, headers, dll
4. ✅ Better performance - Nginx langsung ke frontend container

## Ports

| Service | Container Port | Host Port | Via Nginx |
|---------|---|---|---|
| Frontend | 3000 | 3000 | yourdomain.com |
| Backend | 5000 | 5000 | api.yourdomain.com |
| MySQL | 3306 | 3306 | N/A (no direct access) |

## Health Check

```bash
# Check frontend running
curl http://localhost:3000

# Check backend running
curl http://localhost:5000

# Check docker status
docker-compose ps
```

## Logs

```bash
# Frontend logs
docker-compose logs -f frontend

# Backend logs
docker-compose logs -f backend

# All logs
docker-compose logs -f
```

## SSL/HTTPS

Setup di Nginx, bukan di Docker:

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com
sudo certbot certonly --standalone -d api.yourdomain.com

# Update nginx config dengan SSL
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

## Troubleshooting

### "Cannot GET /" di browser
- Check Nginx forwarding ke http://localhost:3000
- Check docker-compose ps - frontend running?
- Check logs: `docker-compose logs frontend`

### 503 Bad Gateway
- Backend not running: `docker-compose up backend`
- Check Nginx upstream config

### Frontend container exits
```bash
# Check error
docker-compose logs frontend

# Common: port already in use
lsof -i :3000
```

## Production Checklist

- ✅ Nginx reverse proxy configured
- ✅ SSL certificates installed
- ✅ Security headers added di Nginx
- ✅ MySQL external connection tested
- ✅ Backend JWT_SECRET strong
- ✅ VITE_API_URL pointing ke backend
- ✅ Docker containers auto-restart
- ✅ Logs being monitored

## Next Steps

1. Build frontend: `docker-compose build frontend`
2. Start all: `docker-compose up -d`
3. Configure Nginx
4. Test: `curl http://yourdomain.com`
