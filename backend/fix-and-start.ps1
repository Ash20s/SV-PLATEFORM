# Script pour corriger et démarrer le backend

Write-Host "🔧 Correction et démarrage du backend" -ForegroundColor Cyan
Write-Host "=" * 50
Write-Host ""

# 1. Arrêter les processus Node sur le port 5000
Write-Host "1️⃣ Nettoyage des processus..." -ForegroundColor Yellow
$port5000 = netstat -ano | findstr :5000
if ($port5000) {
    Write-Host "   Port 5000 utilisé, recherche du processus..." -ForegroundColor White
    $lines = $port5000 -split "`n"
    foreach ($line in $lines) {
        if ($line -match 'LISTENING\s+(\d+)') {
            $pid = $matches[1]
            Write-Host "   Arrêt du processus $pid..." -ForegroundColor White
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "   ✅ Port 5000 libre" -ForegroundColor Green
}

# 2. Vérifier MongoDB
Write-Host ""
Write-Host "2️⃣ Vérification de MongoDB..." -ForegroundColor Yellow
try {
    $mongoTest = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
    if ($mongoTest.TcpTestSucceeded) {
        Write-Host "   ✅ MongoDB accessible" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  MongoDB non accessible sur le port 27017" -ForegroundColor Yellow
        Write-Host "   Vérifiez que MongoDB est démarré" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Impossible de vérifier MongoDB" -ForegroundColor Yellow
}

# 3. Vérifier le fichier .env
Write-Host ""
Write-Host "3️⃣ Vérification de la configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   ✅ Fichier .env présent" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Fichier .env manquant, création..." -ForegroundColor Yellow
    @"
MONGODB_URI=mongodb://localhost:27017/supervive
JWT_SECRET=your-secret-key-change-in-production-$(Get-Random)
CLIENT_URL=http://localhost:5173
PORT=5000
SUPERVIVE_USE_MOCK=true
"@ | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "   ✅ Fichier .env créé" -ForegroundColor Green
}

# 4. Vérifier les dépendances
Write-Host ""
Write-Host "4️⃣ Vérification des dépendances..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules présent" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Installation des dépendances..." -ForegroundColor Yellow
    npm install
}

# 5. Démarrer le serveur
Write-Host ""
Write-Host "5️⃣ Démarrage du serveur..." -ForegroundColor Yellow
Write-Host "   Le serveur va démarrer dans une nouvelle fenêtre" -ForegroundColor White
Write-Host ""

$backendPath = (Get-Location).Path
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '🚀 Backend démarrant...' -ForegroundColor Green; Write-Host '📡 URL: http://localhost:5000' -ForegroundColor Cyan; Write-Host ''; npm run dev"

Write-Host "✅ Serveur en cours de démarrage..." -ForegroundColor Green
Write-Host ""
Write-Host "⏳ Attente de 8 secondes pour le démarrage..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# 6. Vérifier que le serveur répond
Write-Host ""
Write-Host "6️⃣ Vérification du serveur..." -ForegroundColor Yellow
$maxAttempts = 5
$attempt = 0
$serverReady = $false

while ($attempt -lt $maxAttempts -and -not $serverReady) {
    $attempt++
    Write-Host "   Tentative $attempt/$maxAttempts..." -ForegroundColor White
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/mock/stats" -Method GET -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        Write-Host "   ✅ Serveur accessible !" -ForegroundColor Green
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor White
        $serverReady = $true
        
        # Afficher les stats
        try {
            $data = $response.Content | ConvertFrom-Json
            Write-Host ""
            Write-Host "📊 Données disponibles:" -ForegroundColor Cyan
            Write-Host "   Mode: $($data.mode)" -ForegroundColor White
            Write-Host "   Matches mock: $($data.stats.totalMatches)" -ForegroundColor White
        } catch {
            # Ignorer l'erreur de parsing
        }
    } catch {
        if ($attempt -lt $maxAttempts) {
            Write-Host "   ⏳ En attente..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        } else {
            Write-Host "   ⚠️  Serveur pas encore prêt" -ForegroundColor Yellow
            Write-Host "   Vérifiez la fenêtre PowerShell pour les erreurs" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "=" * 50
if ($serverReady) {
    Write-Host "✅ Backend démarré avec succès !" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Testez maintenant:" -ForegroundColor Cyan
    Write-Host "   - Frontend: http://localhost:5173" -ForegroundColor White
    Write-Host "   - Backend:  http://localhost:5000" -ForegroundColor White
    Write-Host "   - API Stats: http://localhost:5000/api/mock/stats" -ForegroundColor White
} else {
    Write-Host "⚠️  Le serveur n'a pas démarré correctement" -ForegroundColor Yellow
    Write-Host "   Vérifiez la fenêtre PowerShell pour les erreurs" -ForegroundColor Yellow
}

