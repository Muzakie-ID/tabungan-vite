docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
docker-compose logs --tail=50
docker-compose exec backend npm run build
docker-compose exec backend npx prisma studio
docker-compose exec backend npx prisma migrate dev
docker-compose exec frontend npm run build
docker-compose exec mysql mysql -u tabungan -p
docker-compose build
docker-compose build backend
docker-compose build frontend
docker-compose build --no-cache
docker-compose restart
docker-compose restart backend
docker-compose restart frontend
docker-compose restart mysql
docker-compose ps
docker-compose config
docker-compose restart
docker-compose exec mysql mysqldump -u tabungan -p tabungan > backup.sql
docker-compose exec -T mysql mysql -u tabungan -p tabungan < backup.sql
docker-compose exec mysql mysqldump -u tabungan -p tabungan [table_name] > table_backup.sql
docker stats
docker network ls
docker network inspect tabungan_tabungan_network
docker container prune
docker image prune
docker volume prune
docker system prune -a
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec mysql bash
git clone <repo> tabungan
This quick reference has been retired.

Obsolete: Command snippets and small notes were consolidated into `README.md`. If you need specific commands, refer to the README or the project git history.
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
