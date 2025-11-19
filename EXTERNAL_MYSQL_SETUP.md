# External MySQL Configuration Guide

## Situasi
Anda sudah memiliki MySQL server di Docker container lain yang terpisah.

## Setup

### 1. Edit .env file

```env
# Database Configuration (External MySQL)
DB_HOST=host.docker.internal        # Untuk Mac/Windows dengan Docker Desktop
# DB_HOST=172.17.0.1               # Untuk Linux (gateway address)
# DB_HOST=mysql.example.com        # Untuk remote server
# DB_HOST=192.168.1.100            # Untuk IP address tertentu

DB_PORT=3306
DB_USER=tabungan
DB_PASSWORD=tabungan123
DB_NAME=tabungan
```

### 2. Pastikan MySQL sudah running

Verifikasi MySQL container Anda berjalan:
```bash
# Check if MySQL container is running
docker ps | grep mysql

# Test connection
mysql -h localhost -u tabungan -p -D tabungan
# Password: tabungan123
```

### 3. Start application

```bash
# Build dan start services
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Verify connection
docker-compose exec backend npx prisma migrate deploy
```

## Different DB_HOST Values

### Windows / Mac (Docker Desktop)
```
DB_HOST=host.docker.internal
```
**Cara kerja**: Docker Desktop menyediakan hostname special untuk mengakses host machine

### Linux
```
DB_HOST=172.17.0.1
```
**Cara kerja**: Gateway address dari docker0 bridge network

### Custom Network
Jika MySQL di network lain:
```bash
# Lihat network MySQL
docker network inspect <network_name>

# Dapatkan IP MySQL
docker inspect <mysql_container> | grep IPAddress
```

### Remote Server
```
DB_HOST=your-server.com
# atau
DB_HOST=192.168.1.100
```

## Verify Connection

### Method 1: Direct telnet
```bash
telnet host.docker.internal 3306
```

### Method 2: From backend container
```bash
docker-compose exec backend sh
# Di dalam container:
mysql -h host.docker.internal -u tabungan -p
# Password: tabungan123
```

### Method 3: Backend logs
```bash
docker-compose logs backend | grep -i database
docker-compose logs backend | grep -i connection
```

## Troubleshooting

### Connection Refused
- Pastikan MySQL running: `docker ps | grep mysql`
- Pastikan port 3306 exposed
- Check firewall settings

### Cannot resolve hostname
- Cek DB_HOST value di .env
- Untuk Windows/Mac: gunakan `host.docker.internal`
- Untuk Linux: gunakan `172.17.0.1` atau IP address

### Authentication failed
- Verifikasi DB_USER dan DB_PASSWORD
- Pastikan user ada di MySQL: 
  ```sql
  mysql -u root -p
  SELECT user, host FROM mysql.user;
  ```

### Database not found
- Pastikan database `tabungan` sudah dibuat
- Create database jika belum:
  ```sql
  CREATE DATABASE tabungan;
  CREATE USER 'tabungan'@'%' IDENTIFIED BY 'tabungan123';
  GRANT ALL PRIVILEGES ON tabungan.* TO 'tabungan'@'%';
  FLUSH PRIVILEGES;
  ```

## Testing Steps

1. **Verify MySQL is accessible**
   ```bash
   mysql -h host.docker.internal -u tabungan -p tabungan
   ```

2. **Check backend logs**
   ```bash
   docker-compose logs -f backend
   ```

3. **Run migrations manually**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

4. **Check database was created**
   ```bash
   docker-compose exec backend npx prisma studio
   ```

5. **Test API**
   ```bash
   curl http://localhost:5000/health
   curl http://localhost:3000
   ```

## Production Configuration

### For external servers:
```env
DB_HOST=your-mysql-server.com
DB_PORT=3306
DB_USER=production_user
DB_PASSWORD=strong_password_here
DB_NAME=tabungan_prod
```

### For AWS RDS:
```env
DB_HOST=tabungan.c9akciq32.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=your_rds_password
DB_NAME=tabungan
```

### For Google Cloud SQL:
```env
DB_HOST=10.0.0.2
DB_PORT=3306
DB_USER=sqluser
DB_PASSWORD=your_password
DB_NAME=tabungan
```

## Security Notes

1. **Never commit .env file** - Keep it in .gitignore
2. **Use strong passwords** - Change default credentials
3. **Restrict access** - Use firewall rules
4. **Encrypt connections** - Use SSL in production
5. **Backup regularly** - Schedule MySQL backups

## Quick Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Restart backend
docker-compose restart backend

# Check status
docker-compose ps

# Reset migrations (WARNING: destructive)
docker-compose exec backend npx prisma migrate reset
```

## Support

Untuk issue lainnya, check main documentation:
- See: `DOCKER_DEPLOYMENT.md`
- See: `DOCKER_QUICK_REFERENCE.md`
