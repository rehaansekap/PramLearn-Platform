#!/bin/bash
echo "🚀 Starting PramLearn services..."

echo "Starting database server..."
az postgres flexible-server start --resource-group "pramlearn-rg" --name "pramlearn-db"

echo "Waiting for database to be ready..."
sleep 30

echo "Starting backend app service..."
az webapp start --resource-group "pramlearn-rg" --name "pramlearn-backend"

echo "Starting frontend app service..."
az webapp start --resource-group "pramlearn-rg" --name "pramlearn-frontend"

# Check all services status
echo "=== App Services Status ==="
az webapp list --resource-group "pramlearn-rg" --query "[].{name:name, state:state}" --output table

echo "=== Database Status ==="
az postgres flexible-server show --resource-group "pramlearn-rg" --name "pramlearn-db" --query "{name:name, state:state}" --output table

echo "✅ All PramLearn services started!"