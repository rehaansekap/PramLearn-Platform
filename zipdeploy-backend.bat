@echo off
echo [1/5] Masuk ke folder backendpramlearn...
cd backendpramlearn

echo [2/5] Menghapus file backend-deploy.zip lama jika ada...
del backend-deploy.zip 2>nul

echo [3/5] Membuat file zip...
powershell -Command "Compress-Archive -Path * -DestinationPath backend-deploy.zip -Force"

echo [4/5] Deploy ke Azure Web App...
az webapp deployment source config-zip --resource-group pramlearn-rg --name pramlearn-backend --src backend-deploy.zip

echo [5/5] Selesai!