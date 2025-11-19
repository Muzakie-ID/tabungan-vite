docker images | grep tabungan
docker image inspect tabungan_frontend:latest
docker-compose down
This troubleshooting guide has been retired.

Obsolete: Common Docker build notes were moved into `README.md` and consolidated. Keep the repository tidy; restore from git history if you need details.

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
