# ✅ Guide de test complet - Système Mock Supervive API

## 🚀 Démarrage rapide

### Option 1: Test direct (sans serveur) ✅

```bash
node backend/test-mock-simple.js
```

**Résultat attendu:** ✅ Tous les tests passent

### Option 2: Test avec serveur (API REST)

#### Étape 1: Démarrer le serveur

**Dans un terminal PowerShell:**
```powershell
cd backend
.\start-server.ps1
```

**OU manuellement:**
```bash
cd backend
npm run dev
```

Le serveur démarre sur `http://localhost:5000`

#### Étape 2: Tester les endpoints

**Dans un autre terminal ou avec Postman/Insomnia:**

1. **Stats du mock:**
   ```
   GET http://localhost:5000/api/mock/stats
   ```

2. **Liste des matches:**
   ```
   GET http://localhost:5000/api/mock/matches?limit=5
   ```

3. **Synchroniser tous les matches** (nécessite auth):
   ```
   POST http://localhost:5000/api/mock/sync-all
   Headers: Authorization: Bearer <token>
   ```

#### Étape 3: Test automatisé

**Dans un terminal (pendant que le serveur tourne):**
```bash
cd backend
node test-api-endpoints.js
```

## 📋 Checklist de test

- [x] ✅ Mock génère des données
- [x] ✅ Normalisation des données fonctionne
- [x] ✅ Mapping joueurs/équipes
- [x] ✅ Calcul des stats
- [x] ✅ Endpoints REST accessibles
- [ ] ⚠️  Canvas (optionnel - nécessite Python)

## 🎯 Ce qui fonctionne

✅ **Tout fonctionne sauf:**
- Génération de posters (nécessite canvas + Python)

✅ **Fonctionnel:**
- Récupération des matches
- Normalisation des données
- Mapping des joueurs
- Mapping des équipes  
- Synchronisation dans la DB
- Calcul des stats
- Scoring automatique
- Tous les endpoints REST

## 🔧 Configuration

Le système utilise automatiquement le **mode MOCK** si:
- `SUPERVIVE_API_KEY` n'est pas défini
- OU `SUPERVIVE_USE_MOCK=true`

## 📝 Résumé

1. **Test rapide:** `node backend/test-mock-simple.js` ✅
2. **Démarrer serveur:** `cd backend && npm run dev`
3. **Tester API:** Utiliser les endpoints ou `node backend/test-api-endpoints.js`

## 🎉 Tout est prêt !

Le système mock est **100% fonctionnel** et prêt à être utilisé pour le développement et les tests.

