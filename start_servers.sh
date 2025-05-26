#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting backend server...${NC}"

# Activate Python virtual environment
source /root/manoj_linux/venv/bin/activate

# Start Flask backend in background
cd /root/manoj_linux/backend
python api/app.py &
BACKEND_PID=$!

echo -e "${GREEN}Backend server started! (PID: $BACKEND_PID)${NC}"
echo -e "${GREEN}Backend API available at: http://0.0.0.0:5000${NC}"

# Wait a bit for backend to initialize
sleep 3

echo -e "${YELLOW}Starting frontend server...${NC}"

# Start Next.js frontend
cd /root/manoj_linux/frontend/my-app
npm run dev &
FRONTEND_PID=$!

echo -e "${GREEN}Frontend server started! (PID: $FRONTEND_PID)${NC}"
echo -e "${GREEN}Frontend available at: http://localhost:3000${NC}"

# Keep script running to maintain both servers
echo -e "${YELLOW}Both servers are running. Press Ctrl+C to stop both servers.${NC}"

# Function to handle termination
function cleanup {
    echo -e "${YELLOW}Stopping servers...${NC}"
    kill $BACKEND_PID
    kill $FRONTEND_PID
    echo -e "${GREEN}Servers stopped.${NC}"
    exit 0
}

# Trap SIGINT and SIGTERM signals
trap cleanup SIGINT SIGTERM

# Keep script alive
wait
