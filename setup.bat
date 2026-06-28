@echo off
REM ClimateTwin AI Setup Script for Windows

echo ===========================
echo ClimateTwin AI Setup
echo ===========================

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed. Please install Python 3.11+
    exit /b 1
)

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed. Please install Node.js 20+
    exit /b 1
)

echo.
echo Setting up backend...
echo.

cd backend

REM Create virtual environment
python -m venv venv
call venv\Scripts\activate

REM Install dependencies
pip install -r requirements.txt

REM Copy environment file
if not exist .env (
    copy .env.example .env
    echo Created .env file from template
)

echo.
echo Setting up frontend...
echo.

cd ..\frontend

REM Install dependencies
npm install

REM Copy environment file
if not exist .env (
    copy .env.example .env
    echo Created .env file from template
)

cd ..

echo.
echo ===========================
echo Setup Complete!
echo ===========================
echo.
echo To start the application:
echo.
echo 1. Start PostgreSQL database (or use Docker)
echo.
echo 2. Start Backend:
echo    cd backend
echo    venv\Scripts\activate
echo    uvicorn app.main:app --reload
echo.
echo 3. Start Frontend:
echo    cd frontend
echo    npm run dev
echo.
echo Or use Docker:
echo    docker-compose up -d
echo.
echo Access the application:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.
pause
