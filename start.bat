@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1
title ExploreMe AI

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"
set "VENV=%BACKEND%\venv"
set "BP=8000"
set "FP=5173"
set "HEALTH=http://127.0.0.1:%BP%/api/v1/health"
set "ERRORS=0"

echo.
echo  ============================================================
echo.
echo    ExploreMe AI
echo    AI-Powered Career Platform
echo.
echo  ============================================================
echo.

:: Step 1: Prerequisites

echo   [1/9] Checking prerequisites...
echo.

python --version >nul 2>&1
if !errorlevel! neq 0 (
    echo         [FAIL] Python is not installed.
    set /a ERRORS+=1
) else (
    for /f "tokens=2" %%v in ('python --version 2^>^&1') do echo         [OK]   Python %%v
)

pip --version >nul 2>&1
if !errorlevel! neq 0 (
    echo         [FAIL] pip is not installed.
    set /a ERRORS+=1
) else (
    for /f "tokens=2" %%v in ('pip --version 2^>^&1') do echo         [OK]   pip %%v
)

node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo         [FAIL] Node.js is not installed.
    set /a ERRORS+=1
) else (
    for /f %%v in ('node --version 2^>^&1') do echo         [OK]   Node.js %%v
)

call npm --version >nul 2>&1
if !errorlevel! neq 0 (
    echo         [FAIL] npm is not installed.
    set /a ERRORS+=1
) else (
    for /f %%v in ('call npm --version 2^>^&1') do echo         [OK]   npm %%v
)

git --version >nul 2>&1
if !errorlevel! neq 0 (
    echo         [SKIP] Git not found
) else (
    for /f "tokens=3" %%v in ('git --version 2^>^&1') do echo         [OK]   Git %%v
)

if !ERRORS! gtr 0 (
    echo.
    echo   !ERRORS! required tools missing. Install them and re-run.
    pause
    exit /b 1
)
echo.

:: Step 2: Project structure

echo   [2/9] Verifying project structure...
echo.

if not exist "%BACKEND%\app" (
    echo         [FAIL] backend\app not found.
    pause
    exit /b 1
)
if not exist "%FRONTEND%\src" (
    echo         [FAIL] frontend\src not found.
    pause
    exit /b 1
)
echo         [OK]   backend\app
echo         [OK]   frontend\src
echo.

:: Step 3: Virtual environment

echo   [3/9] Python virtual environment...
echo.

if not exist "%VENV%\Scripts\activate.bat" (
    echo         Creating venv...
    python -m venv "%VENV%"
    if !errorlevel! neq 0 (
        echo         [FAIL] Could not create venv.
        pause
        exit /b 1
    )
    echo         [OK]   Created
) else (
    echo         [OK]   Exists
)
echo.

:: Step 4: Backend dependencies

echo   [4/9] Backend dependencies...
echo.

call "%VENV%\Scripts\activate.bat"

pip show fastapi >nul 2>&1
if !errorlevel! neq 0 (
    echo         Installing from requirements.txt...
    pip install -r "%BACKEND%\requirements.txt" --quiet --disable-pip-version-check
    if !errorlevel! neq 0 (
        echo         [FAIL] pip install failed.
        pause
        exit /b 1
    )
    echo         [OK]   Installed
) else (
    echo         [OK]   Already installed
)
echo.

:: Step 5: Frontend dependencies

echo   [5/9] Frontend dependencies...
echo.

if not exist "%FRONTEND%\node_modules" (
    echo         Running npm install...
    pushd "%FRONTEND%"
    call npm install --silent 2>nul
    if !errorlevel! neq 0 (
        echo         [FAIL] npm install failed.
        popd
        pause
        exit /b 1
    )
    popd
    echo         [OK]   Installed
) else (
    echo         [OK]   node_modules exists
)
echo.

:: Step 6: Environment files

echo   [6/9] Environment files...
echo.

set "ENV_OK=1"

if not exist "%BACKEND%\.env" (
    echo         [FAIL] backend\.env missing
    echo                Copy .env.example to .env and fill values.
    set "ENV_OK=0"
) else (
    echo         [OK]   backend\.env found
    set "MVARS="
    for %%V in (MONGODB_URL SECRET_KEY GROQ_API_KEY CLOUDINARY_CLOUD_NAME CLOUDINARY_API_KEY CLOUDINARY_API_SECRET) do (
        findstr /C:"%%V" "%BACKEND%\.env" >nul 2>&1
        if !errorlevel! neq 0 set "MVARS=!MVARS! %%V"
    )
    if defined MVARS (
        echo         [WARN] Missing:!MVARS!
    )
)

if not exist "%FRONTEND%\.env" (
    (echo VITE_API_BASE_URL=http://localhost:%BP%/api/v1)> "%FRONTEND%\.env"
    echo         [OK]   frontend\.env created
) else (
    echo         [OK]   frontend\.env found
    findstr /C:"VITE_API_BASE_URL" "%FRONTEND%\.env" >nul 2>&1
    if !errorlevel! neq 0 echo         [WARN] VITE_API_BASE_URL not set
)

if "!ENV_OK!"=="0" (
    echo.
    echo   Fix environment configuration and re-run.
    pause
    exit /b 1
)
echo.

:: Step 7: Free ports

echo   [7/9] Freeing ports...
echo.

for /f "tokens=5" %%i in ('netstat -aon 2^>nul ^| findstr ":%BP% " ^| findstr "LISTENING"') do (
    taskkill /PID %%i /F >nul 2>&1
)
for /f "tokens=5" %%i in ('netstat -aon 2^>nul ^| findstr ":%FP% " ^| findstr "LISTENING"') do (
    taskkill /PID %%i /F >nul 2>&1
)
echo         [OK]   Port %BP% free
echo         [OK]   Port %FP% free
echo.

:: Step 8: Start backend

echo   [8/9] Starting backend...
echo.

start "ExploreMe AI - Backend" cmd /k "cd /d "%BACKEND%" && call "%VENV%\Scripts\activate.bat" && python run.py"

echo         Waiting for health endpoint...
set "HK=0"
for /l %%i in (1,1,30) do (
    if !HK! equ 0 (
        ping -n 2 127.0.0.1 >nul
        curl.exe -s -o NUL -w "%%{http_code}" "!HEALTH!" 2>nul | findstr "200" >nul 2>&1
        if !errorlevel! equ 0 set "HK=1"
    )
)
if !HK! equ 1 (
    echo         [OK]   Backend healthy
) else (
    echo         [WARN] Health check timed out (or started in new terminal^)
)
echo.

:: Step 9: Start frontend

echo   [9/9] Starting frontend...
echo.

start "ExploreMe AI - Frontend" cmd /k "cd /d "%FRONTEND%" && npm run dev"
ping -n 5 127.0.0.1 >nul
start "" "http://localhost:%FP%"
echo         [OK]   Browser opened
echo.

:: Summary

echo  ============================================================
echo.
echo    ExploreMe AI is running.
echo.
echo    Frontend    http://localhost:%FP%
echo    Backend     http://localhost:%BP%
echo    API Docs    http://localhost:%BP%/docs
echo.
echo  ============================================================
echo.

endlocal
