#!/bin/bash
# filepath: azure-setup.sh

# Variables
RESOURCE_GROUP="pramlearn-rg"
LOCATION="Southeast Asia"
APP_NAME_BACKEND="pramlearn-backend"
APP_NAME_FRONTEND="pramlearn-frontend"
DB_SERVER_NAME="pramlearn-db"
REDIS_NAME="pramlearn-redis"
DB_ADMIN_USER="pramadmin"
DB_ADMIN_PASSWORD="123123123"

echo "🚀 Starting Azure deployment setup..."

# Create resource group
echo "📦 Creating resource group..."
az group create --name $RESOURCE_GROUP --location "$LOCATION"

# Create PostgreSQL Flexible Server
echo "🗄️ Creating PostgreSQL database..."
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER_NAME \
  --location "$LOCATION" \
  --admin-user $DB_ADMIN_USER \
  --admin-password $DB_ADMIN_PASSWORD \
  --tier Burstable \
  --sku-name Standard_B1ms \
  --storage-size 32 \
  --version 14 \
  --public-access 0.0.0.0

# Create database
echo "📊 Creating database..."
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $DB_SERVER_NAME \
  --database-name pramlearn_db

# Create Redis Cache
echo "🔴 Creating Redis cache..."
az redis create \
  --resource-group $RESOURCE_GROUP \
  --name $REDIS_NAME \
  --location "$LOCATION" \
  --sku Basic \
  --vm-size c0

# Create App Service Plan
echo "📋 Creating App Service plan..."
az appservice plan create \
  --resource-group $RESOURCE_GROUP \
  --name pramlearn-plan \
  --location "$LOCATION" \
  --sku B1 \
  --is-linux

# Create Backend Web App
echo "🔧 Creating backend web app..."
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan pramlearn-plan \
  --name $APP_NAME_BACKEND \
  --runtime "PYTHON|3.12" \
  --startup-file "startup.sh"

# Create Frontend Web App
echo "🎨 Creating frontend web app..."
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan pramlearn-plan \
  --name $APP_NAME_FRONTEND \
  --runtime "NODE|20-lts"


az webapp config set --resource-group $RESOURCE_GROUP --name $APP_NAME_BACKEND --web-sockets-enabled true
az webapp config set --resource-group $RESOURCE_GROUP --name $APP_NAME_FRONTEND --web-sockets-enabled true
az webapp config hostname add \
  --resource-group $RESOURCE_GROUP \
  --webapp-name $APP_NAME_FRONTEND \
  --hostname pramlearn.tech
az webapp config hostname add \
  --resource-group $RESOURCE_GROUP \
  --webapp-name $APP_NAME_BACKEND \
  --hostname api.pramlearn.tech
az webapp update --resource-group $RESOURCE_GROUP --name $APP_NAME_FRONTEND --https-only true
az webapp update --resource-group $RESOURCE_GROUP --name $APP_NAME_BACKEND --https-only true
az webapp config set --resource-group $RESOURCE_GROUP --name $APP_NAME_FRONTEND --startup-file "pm2 serve /home/site/wwwroot --no-daemon --spa"
az webapp config set --resource-group $RESOURCE_GROUP --name $APP_NAME_BACKEND --startup-file "gunicorn pramlearn_api.asgi:application --worker-class uvicorn.workers.UvicornWorker --bind=0.0.0.0:8000"


# Get connection strings
echo "🔗 Getting connection strings..."
DB_CONNECTION_STRING=$(az postgres flexible-server show-connection-string \
  --server-name $DB_SERVER_NAME \
  --database-name pramlearn_db \
  --admin-user $DB_ADMIN_USER \
  --admin-password $DB_ADMIN_PASSWORD \
  --query connectionStrings.psql_cmd \
  --output tsv)

REDIS_CONNECTION_STRING=$(az redis show-connection-string \
  --resource-group $RESOURCE_GROUP \
  --name $REDIS_NAME \
  --auth-type primary \
  --output tsv)

# Configure backend app settings
echo "⚙️ Configuring backend app settings..."
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME_BACKEND \
  --settings \
    DEBUG=False \
    SECRET_KEY="J35syL0l1789" \
    DATABASE_URL="postgresql://$DB_ADMIN_USER:$DB_ADMIN_PASSWORD@$DB_SERVER_NAME.postgres.database.azure.com:5432/pramlearn_db?sslmode=require" \
    REDIS_URL="$REDIS_CONNECTION_STRING" \
    DJANGO_SETTINGS_MODULE="pramlearn_api.settings" \
    SCM_DO_BUILD_DURING_DEPLOYMENT=true \
    ENABLE_ORYX_BUILD=true

# Configure frontend app settings
echo "⚙️ Configuring frontend app settings..."
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME_FRONTEND \
  --settings \
    REACT_APP_API_URL="https://$APP_NAME_BACKEND.azurewebsites.net" \
    WEBSITE_NODE_DEFAULT_VERSION="20.x"

echo "✅ Azure resources created successfully!"
echo "📋 Resource details:"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Backend URL: https://$APP_NAME_BACKEND.azurewebsites.net"
echo "   Frontend URL: https://$APP_NAME_FRONTEND.azurewebsites.net"
echo "   Database: $DB_SERVER_NAME.postgres.database.azure.com"
echo "   Redis: $REDIS_NAME.redis.cache.windows.net"