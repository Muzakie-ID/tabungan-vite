docker-compose ps
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f
This frontend-only Docker guide has been retired.

Obsolete: Relevant deployment and nginx notes are consolidated into `README.md`. Restore full doc from git history if required.
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
