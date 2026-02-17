#!/bin/bash

# A Feira - Start Server Script
# Usage: bash start.sh

set -e  # Exit on any error

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$PROJECT_DIR/backend"

echo "🚀 A Feira - Starting Server"
echo "================================"
echo ""

# Check if venv exists
if [ ! -d "$BACKEND_DIR/venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Creating virtual environment..."
    python3 -m venv $BACKEND_DIR/venv
fi

# Activate venv
echo "✅ Activating virtual environment..."
source $BACKEND_DIR/venv/bin/activate

# Install dependencies
echo "✅ Installing dependencies..."
pip install -r $BACKEND_DIR/requirements.txt > /dev/null 2>&1

# Check if database exists
if [ ! -f "$PROJECT_DIR/data/feira.db" ]; then
    echo "⚠️  Database not found, will be created on first run"
fi

# Start server
echo ""
echo "✅ Starting Flask server..."
echo ""
echo "================================"
echo "🎉 Server is running!"
echo "================================"
echo ""
echo "📱 Access the app:"
echo "   http://localhost:5000"
echo ""
echo "🖥️  IP Access (mobile):"
echo "   http://$(hostname -I | awk '{print $1}'):5000"
echo ""
echo "📊 Database:"
echo "   $PROJECT_DIR/data/feira.db"
echo ""
echo "🛑 To stop: Press Ctrl+C"
echo ""
echo "================================"
echo ""

cd $BACKEND_DIR
python app.py
