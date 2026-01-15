@echo off
title Install Dependencies
color 0B
cls

echo.
echo ============================================
echo   PERKESO Prosecution System
echo   Install Dependencies
echo ============================================
echo.

REM Get script directory
set SCRIPT_DIR=%~dp0

REM Check if app folder exists
if not exist "%SCRIPT_DIR%app\package.json" (
    echo [ERROR] package.json not found in app folder!
    echo Expected location: %SCRIPT_DIR%app\package.json
    echo.
    pause
    exit /b 1
)

REM Navigate to app directory
cd /d "%SCRIPT_DIR%app"

echo [INFO] Installing dependencies...
echo [INFO] Location: %CD%
echo.

REM Install dependencies
call npm install

if errorlevel 1 (
    echo.
    echo [ERROR] Installation failed!
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Dependencies installed successfully!
echo.
echo You can now run START.bat to start the development server.
echo.
pause
