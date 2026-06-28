#!/bin/bash
# ClimateTwin AI Setup Script for Unix/macOS

echo "==========================="
echo "ClimateTwin AI Setup"
echo "==========================="

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "Python3 is not installed. Please install Python 3.11+"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 20+"
    exit 1
fi

echo ""
echo "Setting up backend..."
echo ""

cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file from template"
fi

echo ""
echo "Setting up frontend..."
echo ""

cd ../frontend

# Install dependencies
npm install

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file from template"
fi

cd ..

echo ""
echo "==========================="
echo "Setup Complete!"
echo "==========================="
echo ""
echo "To start the application:"
echo ""
echo "1. Start PostgreSQL database (or use Docker)"
echo ""
echo "2. Start Backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload"
echo ""
echo "3. Start Frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "Or use Docker:"
echo "   docker-compose up -d"
echo ""
echo "Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
