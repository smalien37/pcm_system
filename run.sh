#!/bin/bash

# PCM System - Run Script

echo "Starting PCM System..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt -q

# Seed data (disabled for production - run manually if needed: python -m backend.seed_data)
# echo "Seeding database..."
# python -m backend.seed_data

# Start the server
echo ""
echo "================================"
echo "Starting FastAPI server..."
echo "Open http://localhost:8000 in your browser"
echo "API docs at http://localhost:8000/docs"
echo ""
echo "Default login credentials:"
echo "  admin@syncflow.com / admin123"
echo "  manager@syncflow.com / manager123"
echo "  user@syncflow.com / user123"
echo "================================"
echo ""

uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
