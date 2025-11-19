# Docker Deployment Guide - Tabungan Bersama

## Prasyarat

- Docker Desktop (atau Docker Engine) terpasang
- Docker Compose terpasang
- Port 3000, 5000 tersedia
- MySQL Server (bisa external atau local)

## Catatan

- **MySQL standalone** atau menggunakan MySQL external? Lihat: `EXTERNAL_MYSQL_SETUP.md`
- Dokumentasi ini untuk setup lengkap dengan MySQL internal

## Quick Start (Development)

### 1. Setup Environment Variables

```bash
# Copy template env
cp .env.docker .env

# Edit .env jika perlu - PENTING: Ubah DB_HOST sesuai setup MySQL Anda
# Untuk local MySQL yang sudah running: DB_HOST=host.docker.internal (Windows/Mac)
# Untuk remote server: DB_HOST=your-server-ip-or-domain
nano .env
```

### 2. Pastikan MySQL sudah siap

Jika menggunakan MySQL external, pastikan sudah running dan accessible:
```bash
mysql -h your-mysql-host -u tabungan -p
# Password: tabungan123
```

Atau lihat: `EXTERNAL_MYSQL_SETUP.md` untuk konfigurasi detail

```bash
# Build images dan start semua services
docker-compose up -d

# Lihat logs
docker-compose logs -f

# Cek status
docker-compose ps
```

### 3. Database Migration

```bash
# Jalankan Prisma migration otomatis (sudah included di docker-compose command)
# atau manual:
docker-compose exec backend npx prisma migrate deploy
```

### 4. Akses Aplikasi

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- ~~Adminer (DB Manager)~~: Tidak ada (MySQL external)

## Production Deployment

### 1. Persiapan Server

```bash
# Install Docker dan Docker Compose di server
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2. Setup Aplikasi

```bash
# Clone repository
git clone <your-repo-url> tabungan
cd tabungan

# Copy dan konfigurasi .env
cp .env.docker .env
nano .env  # PENTING: Edit DB_HOST sesuai MySQL Anda
```

### 3. Update Environment untuk Production

```env
# .env (Production)
NODE_ENV=production

# IMPORTANT: Change these!
JWT_SECRET=<strong-random-secret-key>
DB_PASSWORD=<strong-database-password>

# Database - Ubah sesuai lokasi MySQL Anda
# Untuk server lokal dengan Docker:
# DB_HOST=host.docker.internal
# Untuk remote server:
# DB_HOST=192.168.1.100
DB_HOST=your-mysql-host

# Domain configuration
VITE_API_URL=https://api.yourdomain.com
```

### 4. Generate Strong Secrets

```bash
# Generate JWT Secret
openssl rand -base64 32

# Generate DB Password
openssl rand -base64 16
```

### 5. Verify Database Connection

**PENTING**: Sebelum start services, pastikan MySQL sudah accessible.

Lihat `EXTERNAL_MYSQL_SETUP.md` untuk detail konfigurasi MySQL external

```bash
# Install certbot for Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot certonly --standalone -d api.yourdomain.com
sudo certbot certonly --standalone -d yourdomain.com
```

### 6. Create Nginx Reverse Proxy

```bash
# Create nginx config di /etc/nginx/sites-available/tabungan
nano /etc/nginx/sites-available/tabungan
```

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/tabungan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Start Services

```bash
# Start Docker containers
docker-compose up -d

# View logs
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
