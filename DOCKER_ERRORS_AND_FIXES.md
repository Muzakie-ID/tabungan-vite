# Docker Errors & Fixes

## Error 1: "Can't write to /app/node_modules/@prisma/engines"

### Cause
- OpenSSL tidak terinstall di Alpine
- Prisma tidak punya permission untuk write ke node_modules

### Solution (FIXED)
1. ✅ Added OpenSSL ke builder stage: `RUN apk add --no-cache openssl`
2. ✅ Added OpenSSL ke production stage
3. ✅ Fixed permissions: `RUN chmod -R 755 node_modules`

### Dockerfile Changes
```dockerfile
# Install OpenSSL untuk Prisma
RUN apk add --no-cache openssl

# ...later...

# Fix permissions untuk node_modules
RUN chmod -R 755 node_modules
```

## Error 2: "the attribute `version` is obsolete"

### Cause
Docker Compose v2 tidak lagi memerlukan `version: '3.8'`

### Solution (FIXED)
Removed `version: '3.8'` dari docker-compose.yml

### Before
```yaml
version: '3.8'

services:
  backend:
    ...
```

### After
```yaml
services:
  backend:
    ...
```

## Error 3: "Bind for 127.0.0.1:3000 failed: port is already allocated"

### Cause
Port 3000 masih terpakai oleh proses lain

### Solution
Use cleanup script (included)

## How to Fix at Ubuntu VPS

### Quick Fix (All at once)

```bash
cd ~/tabungan-vite

# Make script executable
chmod +x cleanup-and-restart.sh

# Run cleanup and restart
./cleanup-and-restart.sh
```

### Manual Fix (Step by step)

```bash
# 1. Stop containers
docker-compose down

# 2. Kill proses on ports
sudo fuser -k 3000/tcp
sudo fuser -k 5000/tcp
sudo fuser -k 8090/tcp

# 3. Clean up Docker
docker system prune -f

# 4. Rebuild images with latest Dockerfile
docker-compose build --no-cache

# 5. Start services
docker-compose up -d

# 6. Check status
docker-compose ps

# 7. View logs
docker-compose logs -f backend
```

## Verify Everything Works

```bash
# Check containers running
docker-compose ps

# Check backend logs (should see "listening on port 5000")
docker-compose logs backend | tail -20

# Check frontend logs
docker-compose logs frontend | tail -20

# Test API
curl http://localhost:5000/health

# Test Frontend
curl http://localhost:8090
```

## Troubleshooting

### Still getting Prisma errors?
```bash
# Rebuild without cache
docker-compose build --no-cache backend

# Remove images completely
docker image rm tabungan-vite-backend

# Rebuild
docker-compose build backend
```

### Ports still busy?
```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :5000
sudo lsof -i :8090

# Kill by PID
sudo kill -9 <PID>
```

### Container exits immediately?
```bash
# Check error logs
docker-compose logs backend

# Start in foreground to see errors
docker-compose up backend
```

## Files Changed

1. ✅ **docker-compose.yml** - Removed `version: '3.8'`
2. ✅ **backend/Dockerfile** - Added OpenSSL, fixed permissions
3. ✅ **cleanup-and-restart.sh** - New cleanup script

## Success Indicators

✓ No Prisma permission errors
✓ No port allocation errors
✓ Containers running and healthy
✓ Can access http://localhost:8090 (frontend)
✓ Can access http://localhost:5000 (backend)
