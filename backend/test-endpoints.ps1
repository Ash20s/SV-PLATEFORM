# Script pour tester les endpoints de l'API Mock

Write-Host "🧪 Tests des endpoints Mock API" -ForegroundColor Cyan
Write-Host "=" * 50
Write-Host ""

# Vérifier que le serveur est accessible
Write-Host "1️⃣ Vérification du serveur..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/mock/stats" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Serveur accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Serveur non accessible !" -ForegroundColor Red
    Write-Host "   Démarrez le serveur avec: .\start-server.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "2️⃣ Test: GET /api/mock/stats" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/mock/stats" -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Succès" -ForegroundColor Green
    Write-Host "   Mode: $($data.mode)" -ForegroundColor White
    Write-Host "   Matches: $($data.stats.totalMatches)" -ForegroundColor White
    Write-Host "   Players: $($data.stats.totalPlayers)" -ForegroundColor White
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "3️⃣ Test: GET /api/mock/matches" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/mock/matches?limit=3" -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Succès" -ForegroundColor Green
    Write-Host "   Matches trouvés: $($data.total)" -ForegroundColor White
    if ($data.matches.Count -gt 0) {
        Write-Host "   Premier match: $($data.matches[0].matchId)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=" * 50
Write-Host "✅ Tests terminés !" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Pour plus de tests, utilisez:" -ForegroundColor Cyan
Write-Host "   node test-api-endpoints.js" -ForegroundColor White

