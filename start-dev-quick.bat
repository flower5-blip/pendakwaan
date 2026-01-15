@echo off
title PERKESO Development Server
color 0A

echo.
echo ============================================
echo   PERKESO Prosecution System
echo   Development Server - Quick Start
echo ============================================
echo.

REM Get script directory
set SCRIPT_DIR=%~dp0

REM Check if app folder exists
if not exist "%SCRIPT_DIR%app\package.json" (
    echo [ERROR] package.json not found in app folder!
    echo Expected location: %SCRIPT_DIR%app\package.json
    pause
    exit /b 1
)

REM Navigate to app directory
cd /d "%SCRIPT_DIR%app"

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INSTALL] Installing dependencies...
    call npm install
    echo.
)

REM Open browser immediately
start "" "http://localhost:3000"

REM Start dev server
echo [START] Starting server...
echo [INFO] Browser will open automatically
echo [INFO] Press Ctrl+C to stop
echo.
echo ============================================
echo.

call npm run dev

pause
