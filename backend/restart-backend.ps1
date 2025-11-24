# Script pour redémarrer le backend proprement

Write-Host "🔄 Redémarrage du backend..." -ForegroundColor Yellow
Write-Host ""

# Arrêter tous les processus Node liés au backend
Write-Host "1️⃣ Arrêt des processus Node existants..." -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   Trouvé $($nodeProcesses.Count) processus Node" -ForegroundColor White
    # On ne tue pas tous les processus Node car il y a peut-être le frontend
    # On va juste démarrer le backend dans un nouveau terminal
} else {
    Write-Host "   Aucun processus Node trouvé" -ForegroundColor White
}

Write-Host ""
Write-Host "2️⃣ Vérification de MongoDB..." -ForegroundColor Cyan
try {
    $mongoTest = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
    if ($mongoTest.TcpTestSucceeded) {
        Write-Host "   ✅ MongoDB est accessible sur le port 27017" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  MongoDB ne répond pas sur le port 27017" -ForegroundColor Yellow
        Write-Host "   Vérifiez que MongoDB est démarré" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Impossible de vérifier MongoDB" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "3️⃣ Démarrage du backend..." -ForegroundColor Cyan
Write-Host "   Le serveur va démarrer dans une nouvelle fenêtre" -ForegroundColor White
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '🚀 Démarrage du backend...' -ForegroundColor Green; Write-Host ''; npm run dev"

Write-Host "✅ Backend en cours de démarrage..." -ForegroundColor Green
Write-Host ""
Write-Host "⏳ Attente de 5 secondes..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "4️⃣ Vérification du serveur..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/mock/stats" -Method GET -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✅ Backend accessible !" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "   ⚠️  Backend pas encore prêt, attendez quelques secondes..." -ForegroundColor Yellow
    Write-Host "   URL: http://localhost:5000" -ForegroundColor White
}

Write-Host ""
Write-Host "✅ Redémarrage terminé !" -ForegroundColor Green

