#!/bin/bash

echo "Starting the backend server..."
cd /root/manoj_linux
source venv/bin/activate
cd backend/api
python app.py
