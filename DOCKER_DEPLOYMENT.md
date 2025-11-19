docker-compose up -d
docker-compose logs -f
docker-compose ps
docker-compose exec backend npx prisma migrate deploy
git clone <your-repo-url> tabungan
docker-compose up -d
This deployment guide has been retired and consolidated into `README.md`.

The README contains the current, concise deployment and troubleshooting steps. Restore full guide from git history if you need the extended version.
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

## Common Commands

### Container Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f [service-name]

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Execute command in container
docker-compose exec backend npm run build
docker-compose exec mysql mysql -u root -p
```

### Database Management

```bash
# Access MySQL
docker-compose exec mysql mysql -u tabungan -p tabungan

# View Adminer
http://localhost:8080
# Server: mysql
# User: tabungan
# Password: tabungan123
# Database: tabungan

# Backup database
docker-compose exec mysql mysqldump -u tabungan -p tabungan > backup.sql

# Restore database
docker-compose exec -T mysql mysql -u tabungan -p tabungan < backup.sql
```

### Prisma Commands

```bash
# Create migration
docker-compose exec backend npx prisma migrate dev --name <name>

# Apply migrations
docker-compose exec backend npx prisma migrate deploy

# Generate Prisma client
docker-compose exec backend npx prisma generate

# View database
docker-compose exec backend npx prisma studio
```

## Monitoring

### Health Checks

```bash
# Check service status
docker-compose ps

# Manual health check
curl http://localhost:5000/health
curl http://localhost:3000/
```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# Follow logs with tail
docker-compose logs -f

# Logs for specific service
docker-compose logs -f frontend --tail=50

# View error logs
docker-compose logs backend | grep error
```

## Scaling (Optional)

```bash
# Scale backend to 3 instances (for load balancing)
docker-compose up -d --scale backend=3

# Note: May need load balancer configuration
```

## Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (careful!)
docker-compose down -v

# Remove images
docker image rm tabungan_backend tabungan_frontend

# Clean up unused images
docker image prune -a
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Database Connection Failed

```bash
# Check MySQL is running
docker-compose ps mysql

# Check logs
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql
```

### Build Fails

```bash
# Clear cache and rebuild
docker-compose build --no-cache

# Rebuild specific service
docker-compose build --no-cache backend
```

### Container Won't Start

```bash
# View detailed logs
docker-compose logs <service-name>

# Check resources
docker stats

# Increase memory limit in docker-compose.yml
```

## Environment Variables Reference

### Backend (.env)

```
NODE_ENV=production
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=<secret-key>
PORT=5000
```

### Frontend (.env)

```
VITE_API_URL=http://backend:5000 (internal)
VITE_API_URL=https://api.yourdomain.com (external)
```

## Security Best Practices

1. **Change default passwords** di .env
2. **Generate strong JWT_SECRET** menggunakan openssl
3. **Use HTTPS** dengan SSL certificate
4. **Set firewall rules** untuk restrict access
5. **Regular backups** database
6. **Keep images updated** dengan latest patches
7. **Use secrets management** untuk sensitive data
8. **Monitor logs** untuk security issues
9. **Rate limiting** pada API endpoints
10. **CORS configuration** untuk frontend access

## Backup & Recovery

### Backup Database

```bash
docker-compose exec mysql mysqldump -u tabungan -p tabungan > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
docker-compose exec -T mysql mysql -u tabungan -p tabungan < backup.sql
```

### Backup volumes

```bash
docker run --rm -v tabungan_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql_backup.tar.gz /data
```

## Support & Documentation

- Docker Docs: https://docs.docker.com
- Docker Compose: https://docs.docker.com/compose
- Prisma: https://www.prisma.io/docs
- Express.js: https://expressjs.com
- React: https://react.dev
- Nginx: https://nginx.org/en/docs/
