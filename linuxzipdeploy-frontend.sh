#!/bin/bash
# filepath: zipdeploy-frontend.sh

echo "[1/6] Masuk ke folder frontendpramlearn..."
cd frontendpramlearn

echo "[2/6] Menghapus folder dist jika ada..."
rm -rf dist

echo "[3/6] Menghapus file frontend-deploy.zip lama jika ada..."
rm -f ../frontend-deploy.zip

echo "[4/6] Install dependencies..."
npm i

echo "[5/6] Build project..."
npm run build

echo "[6/6] Membuat deployment package..."
cd dist
echo '{
  "name": "pramlearn-frontend",
  "version": "1.0.0",
  "scripts": {
    "start": "npx serve . -s -p 8080"
  },
  "dependencies": {
    "serve": "^14.2.0"
  }
}' > package.json

zip -r ../../frontend-deploy.zip .

echo "[8/8] Deploy ke Azure Web App..."
cd ../..
az webapp deployment source config-zip --resource-group pramlearn-rg --name pramlearn-frontend --src frontend-deploy.zip

echo "Frontend deploy selesai!"