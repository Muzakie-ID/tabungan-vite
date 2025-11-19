# Quick Reference - Docker Commands

## Start Application

### Development
```bash
docker-compose up
```

### Production
```bash
docker-compose up -d
```

## Stop Application

```bash
docker-compose down
```

## View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Last 50 lines
docker-compose logs --tail=50
```

## Access Services

```bash
# Frontend
http://localhost:3000

# Backend API
http://localhost:5000

# Database Manager (Adminer)
http://localhost:8080
```

## Database Access

### Via Command Line
```bash
docker-compose exec mysql mysql -u tabungan -p tabungan
# Password: tabungan123
```

### Via Adminer (Web UI)
```
URL: http://localhost:8080
Server: mysql
User: tabungan
Password: tabungan123
Database: tabungan
```

## Execute Commands in Containers

```bash
# Backend
docker-compose exec backend npm run build
docker-compose exec backend npx prisma studio
docker-compose exec backend npx prisma migrate dev

# Frontend
docker-compose exec frontend npm run build

# MySQL
docker-compose exec mysql mysql -u tabungan -p
```

## Rebuild Services

```bash
# Rebuild all
docker-compose build

# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild without cache
docker-compose build --no-cache
```

## Restart Services

```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
docker-compose restart frontend
docker-compose restart mysql
```

## Container Status

```bash
docker-compose ps
```

## Environment Variables

### View current env
```bash
docker-compose config
```

### Edit .env file
```bash
nano .env
docker-compose restart
```

## Database Operations

### Backup
```bash
docker-compose exec mysql mysqldump -u tabungan -p tabungan > backup.sql
```

### Restore
```bash
docker-compose exec -T mysql mysql -u tabungan -p tabungan < backup.sql
```

### Export specific table
```bash
docker-compose exec mysql mysqldump -u tabungan -p tabungan [table_name] > table_backup.sql
```

## Troubleshooting

### Check resource usage
```bash
docker stats
```

### View network
```bash
docker network ls
docker network inspect tabungan_tabungan_network
```

### Remove unused resources
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a
```

### Access container shell
```bash
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec mysql bash
```

## Production Deployment

### Initial setup
```bash
# Clone and setup
git clone <repo> tabungan
cd tabungan

# Copy and edit env
cp .env.docker .env
nano .env  # Edit for production

# Deploy
chmod +x deploy.sh
./deploy.sh
```

### Using deployment script
```bash
# Linux/Mac
./deploy.sh

# Windows
deploy.bat
```

### Manual deployment
```bash
docker-compose build
docker-compose up -d
docker-compose exec backend npx prisma migrate deploy
```

### SSL Setup with Nginx

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Configure Nginx reverse proxy
# See DOCKER_DEPLOYMENT.md for details
```

## Monitoring Health

### Health checks
```bash
# Backend
curl http://localhost:5000/health

# Frontend
curl http://localhost:3000

# MySQL
docker-compose exec mysql mysqladmin ping
```

### Container logs with timestamps
```bash
docker-compose logs -f --timestamps
```

## Development Workflow

### Make changes
```bash
# Edit files in src/
nano src/server.ts
```

### Rebuild affected service
```bash
docker-compose build backend
docker-compose up -d backend
```

### View live logs
```bash
docker-compose logs -f backend
```

### Access Prisma Studio
```bash
docker-compose exec backend npx prisma studio
```

## Performance Optimization

### Enable BuildKit
```bash
export DOCKER_BUILDKIT=1
docker-compose build
```

### Increase memory limit (if needed)
Edit docker-compose.yml:
```yaml
services:
  backend:
    mem_limit: 2g
    memswap_limit: 2g
```

### Update resource limits
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Support

For more details, see: `DOCKER_DEPLOYMENT.md`
