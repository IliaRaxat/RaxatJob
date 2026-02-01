@echo off
REM RaxatJob Quick Deployment Script for Windows
REM This script helps you deploy the application quickly

echo ========================================
echo    RaxatJob Deployment Script
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo [WARNING] .env file not found. Creating from .env.example...
    copy .env.example .env
    echo [SUCCESS] Created .env file. Please edit it with your configuration!
    echo.
    echo IMPORTANT: Edit .env and change:
    echo   - POSTGRES_PASSWORD
    echo   - JWT_SECRET
    echo   - SESSION_SECRET
    echo   - ALLOWED_ORIGINS (add your domain^)
    echo   - NEXT_PUBLIC_BACKEND_URL (if deploying to production^)
    echo.
    pause
)

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

echo [SUCCESS] Docker and Docker Compose are installed
echo.

REM Ask deployment type
echo Select deployment type:
echo 1^) Development (with hot reload^)
echo 2^) Production (optimized build^)
set /p choice="Enter choice [1-2]: "

if "%choice%"=="1" (
    echo.
    echo [INFO] Starting development environment...
    echo.
    
    REM Start PostgreSQL
    docker-compose up -d postgres
    
    echo [INFO] Waiting for PostgreSQL to be ready...
    timeout /t 5 /nobreak >nul
    
    REM Run migrations
    echo [INFO] Running database migrations...
    cd Backend
    call npm install
    call npx prisma migrate deploy
    call npx prisma generate
    
    REM Seed data (optional^)
    set /p seed_choice="Do you want to seed sample data? (y/n^): "
    if /i "%seed_choice%"=="y" (
        echo [INFO] Seeding database...
        node seed-sample-data.js
    )
    
    cd ..
    
    echo.
    echo [SUCCESS] Development environment is ready!
    echo.
    echo To start the servers:
    echo   Backend:  cd Backend ^&^& npm run start:dev
    echo   Frontend: cd Frontend ^&^& npm run dev
    echo.
    
) else if "%choice%"=="2" (
    echo.
    echo [INFO] Building and starting production environment...
    echo.
    
    REM Build and start all services
    docker-compose up -d --build
    
    echo [INFO] Waiting for services to start...
    timeout /t 10 /nobreak >nul
    
    REM Check if services are running
    docker ps | findstr raxatjob-backend >nul
    if errorlevel 1 (
        echo [ERROR] Backend failed to start. Check logs:
        echo   docker-compose logs backend
        pause
        exit /b 1
    )
    
    docker ps | findstr raxatjob-frontend >nul
    if errorlevel 1 (
        echo [ERROR] Frontend failed to start. Check logs:
        echo   docker-compose logs frontend
        pause
        exit /b 1
    )
    
    echo.
    echo [SUCCESS] Deployment successful!
    echo.
    echo Application URLs:
    echo   Frontend: http://localhost:3000
    echo   Backend:  http://localhost:3001
    echo.
    echo View logs:
    echo   All services: docker-compose logs -f
    echo   Backend:      docker-compose logs -f backend
    echo   Frontend:     docker-compose logs -f frontend
    echo.
    echo Stop services:
    echo   docker-compose down
    echo.
    
    REM Seed data (optional^)
    set /p seed_choice="Do you want to seed sample data? (y/n^): "
    if /i "%seed_choice%"=="y" (
        echo [INFO] Seeding database...
        docker-compose exec backend node seed-sample-data.js
        echo [SUCCESS] Database seeded!
    )
    
) else (
    echo Invalid choice. Exiting.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Done!
pause
