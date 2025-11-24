# 🧪 Guide de test rapide

## Tests sans serveur (Mock direct)

### Test 1: Mock simple
```bash
node backend/test-mock-simple.js
```

Teste directement le service mock sans dépendances serveur.

## Tests avec serveur (API REST)

### 1. Démarrer le serveur

Dans un terminal :
```bash
cd backend
npm run dev
```

### 2. Tester les endpoints

Dans un autre terminal ou avec un outil comme Postman/Insomnia :

#### A. Vérifier les stats du mock
```bash
GET http://localhost:5000/api/mock/stats
```

#### B. Lister les matches mock
```bash
GET http://localhost:5000/api/mock/matches?limit=5
```

#### C. Synchroniser tous les matches (nécessite auth)
```bash
POST http://localhost:5000/api/mock/sync-all
Headers: 
  Authorization: Bearer <your_token>
  Content-Type: application/json
```

#### D. Ajouter un match mock (nécessite auth)
```bash
POST http://localhost:5000/api/mock/match
Headers: 
  Authorization: Bearer <your_token>
```

### 3. Script automatisé

```bash
# PowerShell
.\backend\run-tests.ps1

# Ou manuellement
node backend/test-api-endpoints.js
```

## ⚠️ Note sur Canvas

Le module `canvas` nécessite Python pour compiler. Il est maintenant **optionnel** :
- ✅ Tous les autres tests fonctionnent sans canvas
- ❌ La génération de posters nécessite canvas (peut être installé plus tard)

Pour installer canvas plus tard (optionnel) :
```bash
# Nécessite Python 3.6+ et Visual Studio Build Tools
npm install canvas
```

## ✅ Ce qui fonctionne sans canvas

- ✅ Récupération des matches
- ✅ Normalisation des données
- ✅ Mapping des joueurs/équipes
- ✅ Synchronisation dans la DB
- ✅ Calcul des stats
- ✅ Scoring automatique
- ✅ Tous les endpoints REST

## 📝 Résumé

1. **Test rapide** : `node backend/test-mock-simple.js` ✅
2. **Démarrer serveur** : `cd backend && npm run dev`
3. **Tester API** : Utiliser les endpoints ci-dessus ou `node backend/test-api-endpoints.js`

