docker ps | grep mysql
docker-compose up -d
docker-compose logs -f backend
docker-compose exec backend npx prisma migrate deploy
docker network inspect <network_name>
docker inspect <mysql_container> | grep IPAddress
telnet host.docker.internal 3306
docker-compose exec backend sh
docker-compose logs backend | grep -i database
docker-compose logs backend | grep -i connection
docker-compose up -d
This external MySQL setup guide has been retired.

Obsolete: External DB notes are summarized in `README.md`. Please restore from git history if you need the full guide.

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
