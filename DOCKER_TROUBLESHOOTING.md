# Docker Build Troubleshooting

## Error: "COPY public ./public: target frontend: failed to solve"

### Cause
Frontend Dockerfile mencoba copy folder `public` yang tidak ada di project.

### Solution
Folder `public` sudah dihapus dari Dockerfile karena:
- Vite tidak memerlukan folder `public` sebagai mandatory
- Project ini hanya punya folder `src`
- Build artifacts di-generate ke folder `dist`

### Fixed File
- `frontend/Dockerfile` - Baris "COPY public ./public" sudah dihapus

### Build Command (Ubuntu VPS)

```bash
# Navigate to project
cd /path/to/tabungan

# Build dan push ke registry (optional)
docker-compose build

# Or rebuild specific service
docker-compose build frontend --no-cache
```

### Verify

```bash
# Check build berhasil
docker images | grep tabungan

# Check frontend image
docker image inspect tabungan_frontend:latest
```

## Other Common Docker Errors

### "failed to compute cache key"
**Cause**: File/folder yang di-reference di COPY command tidak ada

**Solution**: 
1. Pastikan path relatif benar
2. Check file exists di project
3. Use `ls -la` untuk verify

### "permission denied while trying to connect to Docker daemon"

**Solution** (Linux):
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out dan login kembali, atau
newgrp docker
```

### "Bind for 0.0.0.0:3000 failed: port is already allocated"

**Solution**:
```bash
# Kill existing service
docker-compose down

# Or use different port
FRONTEND_PORT=3001 docker-compose up
```

### "cannot connect to Docker daemon"

**Solution**:
```bash
# Start Docker daemon (Linux)
sudo systemctl start docker

# Or restart Docker service
sudo systemctl restart docker
```

## Build Tips

### Faster builds with BuildKit

```bash
# Enable BuildKit
export DOCKER_BUILDKIT=1

# Build
docker-compose build --no-cache
```

### Check Dockerfile syntax

```bash
# Validate Dockerfile
docker run --rm -i hadolint/hadolint < frontend/Dockerfile
```

### View build steps

```bash
# Verbose build output
docker build --progress=plain -t tabungan_frontend frontend/
```

## Success Indicators

After successful build:
```bash
✓ docker-compose build frontend succeeds
✓ Frontend image appears in: docker images
✓ Can run: docker-compose up frontend
```
