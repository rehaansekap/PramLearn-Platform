#!/bin/bash
# filepath: zipdeploy-backend.sh

echo "[1/4] Masuk ke folder backendpramlearn..."
cd backendpramlearn

echo "[2/4] Menghapus file backend-deploy.zip lama jika ada..."
rm -f backend-deploy.zip

echo "[3/4] Membuat file zip..."
zip -r ../backend-deploy.zip . -x "*.git*" "node_modules/*" "__pycache__/*" "*.pyc" "log/*"

echo "[4/4] Deploy ke Azure Web App..."
az webapp deployment source config-zip --resource-group pramlearn-rg --name pramlearn-backend --src ../backend-deploy.zip

echo "Backend deploy selesai!"