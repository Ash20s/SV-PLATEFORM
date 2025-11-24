#!/bin/bash
# Script pour lancer tous les tests

echo "🧪 Lancement des tests du système Mock"
echo "========================================"
echo ""

# Vérifier que le serveur est démarré
echo "1️⃣ Vérification du serveur..."
if curl -s http://localhost:5000/api/mock/stats > /dev/null; then
    echo "✅ Serveur accessible"
else
    echo "❌ Serveur non accessible. Démarrez-le avec: npm run dev"
    exit 1
fi

echo ""
echo "2️⃣ Tests des endpoints..."
node test-api-endpoints.js

echo ""
echo "3️⃣ Tests du mock directement..."
node test-mock-simple.js

echo ""
echo "✅ Tous les tests terminés !"

