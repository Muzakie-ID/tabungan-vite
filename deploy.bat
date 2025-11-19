@echo off
REM deploy.bat - Automated deployment script untuk Windows

setlocal enabledelayedexpansion

echo.
echo 🚀 Tabungan Bersama - Docker Deployment Script
echo ================================================
echo.

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Docker is not installed or not in PATH
    exit /b 1
)
echo ✓ Docker is installed

REM Check Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Docker Compose is not installed
    exit /b 1
)
echo ✓ Docker Compose is installed

REM Setup environment
echo.
echo ⚠ Setting up environment...
if not exist .env (
    if exist .env.docker (
        copy .env.docker .env >nul
        echo ✓ Created .env from template
    ) else (
        echo ✗ .env.docker template not found
        exit /b 1
    )
) else (
    echo ✓ .env already exists
)

echo.
echo ⚠ Building Docker images...
docker-compose build
if errorlevel 1 (
    echo ✗ Build failed
    exit /b 1
)
echo ✓ Images built successfully

echo.
echo ⚠ Starting services...
docker-compose up -d
if errorlevel 1 (
    echo ✗ Failed to start services
    exit /b 1
)
echo ✓ Services started

echo.
echo ⚠ Waiting for services to be ready...
timeout /t 15 /nobreak

echo.
echo ⚠ Running database migrations...
docker-compose exec -T backend npx prisma migrate deploy
if errorlevel 1 (
    echo ✗ Migrations failed
    exit /b 1
)
echo ✓ Migrations completed

echo.
echo ================================================
echo ✓ Deployment completed successfully!
echo ================================================
echo.
echo Services are now running:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:5000
echo   Adminer:   http://localhost:8080
echo.
echo Database credentials:
echo   User:     tabungan
echo   Database: tabungan
echo.
echo Useful commands:
echo   View logs:       docker-compose logs -f
echo   Stop services:   docker-compose down
echo   Restart:         docker-compose restart
echo.
pause
