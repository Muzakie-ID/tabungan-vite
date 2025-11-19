#!/bin/bash
# cleanup-and-restart.sh - Clean up Docker dan restart services

set -e

echo "🧹 Cleaning up Docker..."

# Stop containers
echo "Stopping containers..."
docker-compose down 2>/dev/null || true

# Kill proses yang masih terpakai port
echo "Killing processes on port 3000..."
sudo fuser -k 3000/tcp 2>/dev/null || true

echo "Killing processes on port 5000..."
sudo fuser -k 5000/tcp 2>/dev/null || true

echo "Killing processes on port 8090..."
sudo fuser -k 8090/tcp 2>/dev/null || true

# Remove old containers dan images
echo "Removing old containers..."
docker container prune -f 2>/dev/null || true

echo "Removing dangling images..."
docker image prune -f 2>/dev/null || true

# Verify ports are free
echo ""
echo "✅ Verifying ports are free..."
(! sudo lsof -i :3000 >/dev/null 2>&1) && echo "   Port 3000: FREE ✓" || echo "   Port 3000: BUSY ✗"
(! sudo lsof -i :5000 >/dev/null 2>&1) && echo "   Port 5000: FREE ✓" || echo "   Port 5000: BUSY ✗"
(! sudo lsof -i :8090 >/dev/null 2>&1) && echo "   Port 8090: FREE ✓" || echo "   Port 8090: BUSY ✗"

echo ""
echo "🔨 Rebuilding images..."
docker-compose build --no-cache

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

echo ""
echo "✅ Services started!"
echo ""
docker-compose ps
echo ""
echo "📝 Access points:"
echo "   Frontend: http://localhost:8090"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📊 View logs:"
echo "   All:      docker-compose logs -f"
echo "   Backend:  docker-compose logs -f backend"
echo "   Frontend: docker-compose logs -f frontend"
