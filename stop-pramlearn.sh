#!/bin/bash
echo "🛑 Stopping PramLearn services..."

echo "Stopping frontend app service..."
az webapp stop --resource-group "pramlearn-rg" --name "pramlearn-frontend"

echo "Stopping backend app service..."
az webapp stop --resource-group "pramlearn-rg" --name "pramlearn-backend"

echo "Stopping database server..."
az postgres flexible-server stop --resource-group "pramlearn-rg" --name "pramlearn-db"

# Check all services status
echo "=== App Services Status ==="
az webapp list --resource-group "pramlearn-rg" --query "[].{name:name, state:state}" --output table

echo "=== Database Status ==="
az postgres flexible-server show --resource-group "pramlearn-rg" --name "pramlearn-db" --query "{name:name, state:state}" --output table

echo "✅ All PramLearn services stopped!"