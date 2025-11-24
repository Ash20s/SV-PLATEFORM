# Script pour démarrer le serveur backend

Write-Host "🚀 Démarrage du serveur backend..." -ForegroundColor Green
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: package.json non trouvé. Assurez-vous d'être dans le répertoire backend." -ForegroundColor Red
    exit 1
}

# Vérifier les dépendances
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
    npm install
}

Write-Host "✅ Démarrage du serveur sur http://localhost:5000" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Pour tester les endpoints:" -ForegroundColor Cyan
Write-Host "   - GET  http://localhost:5000/api/mock/stats" -ForegroundColor White
Write-Host "   - GET  http://localhost:5000/api/mock/matches" -ForegroundColor White
Write-Host "   - POST http://localhost:5000/api/mock/sync-all (avec auth)" -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arrêter le serveur" -ForegroundColor Yellow
Write-Host ""

# Démarrer le serveur
npm run dev

