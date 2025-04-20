#!/bin/bash

# Build script for Render web service

echo "Installing dependencies..."
npm ci

echo "Adding nest to PATH..."
export PATH="$PATH:$(pwd)/node_modules/.bin"

if command -v nest &> /dev/null; then
    echo "nest command is available at: $(which nest)"
else
    echo "ERROR: nest command not found in PATH"
    echo "Attempting to locate nest binary..."
    find ./node_modules -name "nest" | grep -v node_modules/.*node_modules
    exit 1
fi

echo "Building application..."
npm run build

echo "Build completed successfully!"
