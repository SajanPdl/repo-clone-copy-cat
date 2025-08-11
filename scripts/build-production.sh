#!/bin/bash

# Production Build Script for EduSanskriti
echo "🚀 Starting production build for EduSanskriti..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf .dist/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Run linting with auto-fix
echo "🔍 Running linting and auto-fix..."
npm run lint -- --fix

# Run type checking
echo "🔍 Running TypeScript type checking..."
npx tsc --noEmit

# Build the application
echo "🏗️ Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    
    # Show build statistics
    echo "📊 Build Statistics:"
    du -sh dist/
    
    # Create production manifest
    echo "📝 Creating production manifest..."
    echo "Build completed at: $(date)" > dist/build-info.txt
    echo "Build version: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')" >> dist/build-info.txt
    echo "Node version: $(node --version)" >> dist/build-info.txt
    echo "NPM version: $(npm --version)" >> dist/build-info.txt
    
    echo "🎉 Production build is ready for deployment!"
    echo "📁 Build output: dist/"
    echo "🌐 Deploy the contents of the dist/ folder to your web server"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
