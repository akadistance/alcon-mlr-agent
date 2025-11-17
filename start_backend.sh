#!/bin/bash

echo "Starting MLR Pre-Screening Agent Backend..."
echo

# Check if Python is available
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "Error: Python is not installed or not in PATH."
    exit 1
fi

# Use python3 if available, otherwise python
PYTHON_CMD="python"
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Error: Virtual environment not found. Please run the setup first."
    echo "Run: $PYTHON_CMD -m venv venv"
    exit 1
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Check if web requirements are installed
python -c "import flask" &> /dev/null
if [ $? -ne 0 ]; then
    echo "Installing web backend requirements..."
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install web requirements."
        exit 1
    fi
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found. Please create one with your ANTHROPIC_API_KEY."
    echo "Example: ANTHROPIC_API_KEY=your-api-key-here"
    read -p "Press Enter to continue..."
fi

echo "Starting Flask backend server..."
echo "Backend will be available at http://localhost:5000"
echo
echo "Press Ctrl+C to stop the server."
echo

python web_backend_atlas.py
