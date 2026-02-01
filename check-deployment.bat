@echo off
REM RaxatJob Deployment Health Check Script

echo ========================================
echo    RaxatJob Deployment Status
echo ========================================
echo.

REM Check Docker
echo Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker not installed
    pause
    exit /b 1
) else (
    echo [OK] Docker installed
)

REM Check Docker Compose
echo Checking Docker Compose...
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose not installed
    pause
    exit /b 1
) else (
    echo [OK] Docker Compose installed
)

echo.
echo ========================================
echo    Checking Services
echo ========================================
echo.

REM Check PostgreSQL
echo PostgreSQL:
docker ps | findstr raxatjob-postgres >nul
if errorlevel 1 (
    echo   [ERROR] Not running
) else (
    echo   [OK] Running
)

REM Check Backend
echo Backend:
docker ps | findstr raxatjob-backend >nul
if errorlevel 1 (
    echo   [ERROR] Not running
) else (
    echo   [OK] Running
    echo   Checking health...
    curl -s http://localhost:3001/health >nul 2>&1
    if errorlevel 1 (
        echo   [WARNING] Not responding
    ) else (
        echo   [OK] Health check passed
    )
)

REM Check Frontend
echo Frontend:
docker ps | findstr raxatjob-frontend >nul
if errorlevel 1 (
    echo   [ERROR] Not running
) else (
    echo   [OK] Running
    echo   Checking health...
    curl -s http://localhost:3000 >nul 2>&1
    if errorlevel 1 (
        echo   [WARNING] Not responding
    ) else (
        echo   [OK] Health check passed
    )
)

echo.
echo ========================================
echo    Application URLs
echo ========================================
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001
echo.

REM Check .env file
echo Configuration:
if exist .env (
    echo   [OK] .env file found
) else (
    echo   [WARNING] .env file not found (using defaults^)
)

echo.
echo ========================================
echo    Container Stats
echo ========================================
docker-compose ps

echo.
echo ========================================
echo    Useful Commands
echo ========================================
echo   View logs:        docker-compose logs -f
echo   Restart services: docker-compose restart
echo   Stop services:    docker-compose down
echo.

pause
