# Script PowerShell pour lancer tous les tests

Write-Host "🧪 Lancement des tests du système Mock" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que le serveur est démarré
Write-Host "1️⃣ Vérification du serveur..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/mock/stats" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Serveur accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Serveur non accessible. Démarrez-le avec: npm run dev" -ForegroundColor Red
    Write-Host "   Dans un autre terminal: cd backend && npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "2️⃣ Tests des endpoints..." -ForegroundColor Yellow
node test-api-endpoints.js

Write-Host ""
Write-Host "3️⃣ Tests du mock directement..." -ForegroundColor Yellow
node test-mock-simple.js

Write-Host ""
Write-Host "✅ Tous les tests terminés !" -ForegroundColor Green

