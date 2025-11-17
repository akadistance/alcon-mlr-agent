@echo off
echo Starting MLR Pre-Screening Agent Backend...
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH.
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo Error: Virtual environment not found. Please run the setup first.
    echo Run: python -m venv venv
    pause
    exit /b 1
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Check if web requirements are installed
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo Installing web backend requirements...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo Error: Failed to install web requirements.
        pause
        exit /b 1
    )
)

REM Check for .env file
if not exist ".env" (
    echo Warning: .env file not found. Please create one with your ANTHROPIC_API_KEY.
    echo Example: ANTHROPIC_API_KEY=your-api-key-here
    pause
)

echo Starting Flask backend server...
echo Backend will be available at http://localhost:5000
echo.
echo Press Ctrl+C to stop the server.
echo.

python web_backend_atlas.py
