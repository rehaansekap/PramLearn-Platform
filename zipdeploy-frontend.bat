@echo off
echo [1/7] Masuk ke folder frontendpramlearn...
cd frontendpramlearn

echo [2/7] Menghapus folder dist jika ada...
rd /s /q dist

echo [3/7] Menghapus file frontend-deploy.zip lama jika ada...
del ..\frontend-deploy.zip 2>nul

echo [4/7] Install dependencies...
npm i

echo [5/7] Build project...
npm run build

echo [6/7] Membuat file zip...
Compress-Archive -Path * -DestinationPath ../frontend-deploy.zip -Force

echo [7/7] Deploy ke Azure Web App...
cd ..
az webapp deployment source config-zip --resource-group pramlearn-rg --name pramlearn-frontend --src frontend-deploy.zip

echo Selesai!