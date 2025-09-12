@echo off
REM Test Setup and Execution Script for GlobalCanvas (Windows)
REM This script installs testing dependencies and runs the test suite

echo 🧪 Setting up GlobalCanvas Test Environment
echo ===========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Install dependencies
echo 📦 Installing test dependencies...
call npm install

REM Verify testing dependencies are installed
echo 🔍 Verifying test dependencies...
if not exist "node_modules\jest" (
    echo ❌ Jest not found. Installing manually...
    call npm install --save-dev jest @types/jest
)

if not exist "node_modules\@testing-library\react" (
    echo ❌ React Testing Library not found. Installing manually...
    call npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
)

REM Run linting first
echo 🔍 Running ESLint...
call npm run lint
if %errorlevel% neq 0 (
    echo ⚠️ Linting issues found (continuing with tests^)
)

REM Run tests
echo 🧪 Running test suite...
echo ========================

REM Run smoke tests first
echo 🔥 Running smoke tests...
call npx jest __tests__/smoke.test.ts --verbose
if %errorlevel% neq 0 (
    echo ⚠️ Some smoke tests failed
)

REM Run unit tests
echo 🧩 Running unit tests...
call npx jest __tests__/components --verbose
if %errorlevel% neq 0 (
    echo ⚠️ Some unit tests failed
)

call npx jest __tests__/lib --verbose
if %errorlevel% neq 0 (
    echo ⚠️ Some lib tests failed
)

REM Run API tests
echo 🌐 Running API tests...
call npx jest __tests__/api --verbose
if %errorlevel% neq 0 (
    echo ⚠️ Some API tests failed
)

REM Run all tests with coverage
echo 📊 Running full test suite with coverage...
call npm run test:coverage
if %errorlevel% neq 0 (
    echo ⚠️ Some tests failed but continuing...
)

REM Test summary
echo.
echo 🎯 Test Execution Complete
echo ==========================
echo Check the coverage report above for detailed results.
echo.
echo To run tests individually:
echo   npm test                    # Run all tests
echo   npm run test:watch          # Run tests in watch mode  
echo   npm run test:coverage       # Run with coverage report
echo   npx jest ^<specific-test^>    # Run specific test file
echo.
echo For continuous development:
echo   npm run test:watch

pause