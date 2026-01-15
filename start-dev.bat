@echo off
echo ============================================
echo PERKESO Prosecution System - Development Server
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

REM Navigate to app directory
cd /d "%SCRIPT_DIR%app"

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] node_modules not found. Installing dependencies...
    echo.
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed!
        pause
        exit /b 1
    )
    echo.
    echo [SUCCESS] Dependencies installed!
    echo.
)

REM Start the development server
echo [INFO] Starting development server...
echo [INFO] Server will be available at: http://localhost:3000
echo [INFO] Browser will open automatically in 5 seconds...
echo [INFO] Press Ctrl+C to stop the server
echo.
echo ============================================
echo.

REM Open browser after 5 seconds (give server time to start)
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

REM Run npm run dev
call npm run dev

REM If server stops, keep window open
echo.
echo [INFO] Server stopped.
pause
