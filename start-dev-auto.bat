@echo off
title PERKESO Development Server
color 0B

echo.
echo ============================================
echo   PERKESO Prosecution System
echo   Auto Start with Browser
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
    if errorlevel 1 (
        echo [ERROR] Installation failed!
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed!
    echo.
)

REM Start server in background and open browser
echo [START] Starting development server...
echo [INFO] Server: http://localhost:3000
echo [INFO] Browser will open in 5 seconds...
echo.

REM Open browser after 5 seconds
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

REM Start dev server
call npm run dev

pause
