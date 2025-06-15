#!/bin/bash

# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo service postgresql start

# Switch to postgres user and create database
sudo -u postgres psql -c "CREATE USER pramadmin WITH PASSWORD '123123123';"
sudo -u postgres psql -c "CREATE DATABASE pramlearn_db OWNER pramadmin;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE pramlearn_db TO pramadmin;"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '123123123';"


python3 -m venv venv
source venv/bin/activate
cd backendpramlearn

# Create virtual environment
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Make script executable
chmod +x reset_and_seed_postgresql.sh
chmod +x runwebsocket.sh
chmod +x run_gunicorn_websocket.sh

# Run the setup script
./reset_and_seed_postgresql.sh

cd ../frontendpramlearn
rm -rf node_modules package-lock.json
npm install
sudo apt install redis-server -y
sudo service redis-server start
redis-cli ping