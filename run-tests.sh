#!/bin/bash

# Test Setup and Execution Script for GlobalCanvas
# This script installs testing dependencies and runs the test suite

set -e  # Exit on any error

echo "🧪 Setting up GlobalCanvas Test Environment"
echo "==========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies
echo "📦 Installing test dependencies..."
npm install

# Verify testing dependencies are installed
echo "🔍 Verifying test dependencies..."
if [ ! -d "node_modules/jest" ]; then
    echo "❌ Jest not found. Installing manually..."
    npm install --save-dev jest @types/jest
fi

if [ ! -d "node_modules/@testing-library/react" ]; then
    echo "❌ React Testing Library not found. Installing manually..."
    npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
fi

# Run linting first
echo "🔍 Running ESLint..."
npm run lint || echo "⚠️  Linting issues found (continuing with tests)"

# Run tests
echo "🧪 Running test suite..."
echo "========================"

# Run smoke tests first
echo "🔥 Running smoke tests..."
npx jest __tests__/smoke.test.ts --verbose || echo "⚠️  Some smoke tests failed"

# Run unit tests
echo "🧩 Running unit tests..."
npx jest __tests__/components --verbose || echo "⚠️  Some unit tests failed"
npx jest __tests__/lib --verbose || echo "⚠️  Some lib tests failed"

# Run API tests
echo "🌐 Running API tests..."
npx jest __tests__/api --verbose || echo "⚠️  Some API tests failed"

# Run all tests with coverage
echo "📊 Running full test suite with coverage..."
npm run test:coverage || echo "⚠️  Some tests failed but continuing..."

# Test summary
echo ""
echo "🎯 Test Execution Complete"
echo "=========================="
echo "Check the coverage report above for detailed results."
echo ""
echo "To run tests individually:"
echo "  npm test                    # Run all tests"
echo "  npm run test:watch          # Run tests in watch mode"
echo "  npm run test:coverage       # Run with coverage report"
echo "  npx jest <specific-test>    # Run specific test file"
echo ""
echo "For continuous development:"
echo "  npm run test:watch"