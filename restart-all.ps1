# Script pour redémarrer complètement le backend et le frontend

Write-Host "🔄 Redémarrage complet du système" -ForegroundColor Cyan
Write-Host "=" * 50
Write-Host ""

# 1. Arrêter tous les processus Node
Write-Host "1️⃣ Arrêt des processus existants..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "   ✅ Processus arrêtés" -ForegroundColor Green

# 2. Vérifier MongoDB
Write-Host ""
Write-Host "2️⃣ Vérification de MongoDB..." -ForegroundColor Yellow
try {
    $mongo = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
    if ($mongo.TcpTestSucceeded) {
        Write-Host "   ✅ MongoDB accessible" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  MongoDB non accessible" -ForegroundColor Yellow
        Write-Host "   Vérifiez que MongoDB est démarré" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Impossible de vérifier MongoDB" -ForegroundColor Yellow
}

# 3. Démarrer le backend
Write-Host ""
Write-Host "3️⃣ Démarrage du backend..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '🚀 Backend Supervive' -ForegroundColor Green; Write-Host '📡 http://localhost:5000' -ForegroundColor Cyan; Write-Host ''; npm run dev"
Write-Host "   ✅ Backend en cours de démarrage..." -ForegroundColor Green

# 4. Démarrer le frontend
Write-Host ""
Write-Host "4️⃣ Démarrage du frontend..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '🚀 Frontend Supervive' -ForegroundColor Green; Write-Host '🌐 http://localhost:5173' -ForegroundColor Cyan; Write-Host ''; npm run dev"
Write-Host "   ✅ Frontend en cours de démarrage..." -ForegroundColor Green

# 5. Attendre et vérifier
Write-Host ""
Write-Host "5️⃣ Attente du démarrage (15 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "6️⃣ Vérification des serveurs..." -ForegroundColor Yellow

# Vérifier backend
try {
    $backend = Invoke-WebRequest -Uri "http://localhost:5000/api/mock/stats" -Method GET -UseBasicParsing -TimeoutSec 3
    Write-Host "   ✅ Backend accessible (port 5000)" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Backend pas encore prêt" -ForegroundColor Yellow
}

# Vérifier frontend
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -UseBasicParsing -TimeoutSec 3
    Write-Host "   ✅ Frontend accessible (port 5173)" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Frontend pas encore prêt" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=" * 50
Write-Host "✅ Redémarrage terminé !" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Accès:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   - Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "📝 Vérifiez les fenêtres PowerShell pour les logs" -ForegroundColor Yellow

