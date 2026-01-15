@echo off
title PERKESO Development Server
color 0A
cls

echo.
echo ============================================
echo   PERKESO Prosecution System
echo   Development Server
echo ============================================
echo.

REM Get script directory
set SCRIPT_DIR=%~dp0

REM Check if we're in the correct directory
if not exist "%SCRIPT_DIR%app\package.json" (
    echo [ERROR] package.json not found in app folder!
    echo Expected location: %SCRIPT_DIR%app\package.json
    echo.
    echo Please ensure you run this script from the project root directory.
    pause
    exit /b 1
)

REM Navigate to app folder
cd /d "%SCRIPT_DIR%app"

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INSTALL] node_modules not found. Installing dependencies...
    echo [INFO] This may take a few minutes...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] Installation failed!
        echo.
        echo Please run install-dependencies.bat manually to see detailed errors.
        pause
        exit /b 1
    )
    echo.
    echo [SUCCESS] Dependencies installed!
    echo.
) else (
    echo [INFO] Dependencies already installed.
    echo.
)

REM Start server
echo [START] Starting development server...
echo [INFO] Server URL: http://localhost:3000
echo [INFO] Browser will open automatically...
echo.
echo ============================================
echo.

REM Open browser after 5 seconds
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

REM Start dev server
call npm run dev

REM Keep window open if server stops
echo.
echo [INFO] Server stopped.
pause
