#!/bin/bash

# Exit on error
set -e

echo "Starting Football Management System..."

# Start the backend server
echo "Starting backend server..."
cd Backend/admin
node server.js &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait a moment for the backend to initialize
sleep 2

# Start the frontend server
echo "Starting frontend server..."
cd ../../frontend/admin_app
npm start

# This part will only execute if the npm start command exits
echo "Shutting down backend server..."
kill $BACKEND_PID 