@echo off
echo Starting MLR Pre-Screening Agent Web Interface...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo Error: npm is not available. Please make sure Node.js is properly installed.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Error: Failed to install dependencies.
        pause
        exit /b 1
    )
)

echo Starting React development server...
echo The application will open in your browser at http://localhost:3000
echo.
echo Make sure the Python backend is running on port 5000!
echo.

npm start
