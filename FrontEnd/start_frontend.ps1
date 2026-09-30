$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
Set-Location $PSScriptRoot
Write-Host "Instalando dependencias..."
npm install --no-fund --no-audit
Write-Host "Iniciando sitio web..."
npm run dev -- --hostname 0.0.0.0
