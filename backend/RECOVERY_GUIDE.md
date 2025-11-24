# 🔧 Guide de récupération - Site crashé

## ✅ Bonne nouvelle : Les données sont sauvegardées !

Vérification effectuée :
- ✅ MongoDB est accessible
- ✅ **8 utilisateurs** présents
- ✅ **3 équipes** présentes
- ✅ **1 tournoi** présent
- ✅ **1 scrim** présent
- ✅ **2 statistiques joueurs** présentes
- ✅ Toutes les collections sont intactes

## 🔄 Redémarrage du backend

### Option 1: Script automatique

```powershell
cd backend
.\restart-backend.ps1
```

### Option 2: Manuel

```powershell
cd backend
npm run dev
```

## 🔍 Vérifications

### 1. Vérifier MongoDB
```powershell
cd backend
node check-database.js
```

### 2. Vérifier le backend
```powershell
# Dans un navigateur ou avec curl
GET http://localhost:5000/api/mock/stats
```

### 3. Vérifier le frontend
```powershell
# Le frontend devrait être accessible sur
http://localhost:5173
```

## 🐛 Problèmes courants

### Backend ne démarre pas

1. **Port 5000 déjà utilisé**
   ```powershell
   # Trouver le processus utilisant le port 5000
   netstat -ano | findstr :5000
   # Tuer le processus si nécessaire
   ```

2. **MongoDB non démarré**
   ```powershell
   # Vérifier le service MongoDB
   Get-Service MongoDB
   # Démarrer si arrêté
   Start-Service MongoDB
   ```

3. **Variables d'environnement manquantes**
   - Vérifier que `.env` existe dans `backend/`
   - Contenu minimum :
     ```
     MONGODB_URI=mongodb://localhost:27017/supervive
     JWT_SECRET=your-secret-key
     PORT=5000
     ```

### Données manquantes dans le frontend

1. **Backend non accessible**
   - Vérifier que le backend tourne sur `http://localhost:5000`
   - Vérifier les CORS dans `backend/src/server.js`

2. **Cache du navigateur**
   - Vider le cache (Ctrl+Shift+Delete)
   - Recharger la page (Ctrl+F5)

## 📝 Checklist de récupération

- [x] ✅ Vérifier MongoDB (données présentes)
- [ ] ⏳ Redémarrer le backend
- [ ] ⏳ Vérifier que le backend répond
- [ ] ⏳ Vérifier que le frontend se connecte
- [ ] ⏳ Tester l'authentification
- [ ] ⏳ Vérifier les données dans l'interface

## 🚀 Commandes rapides

```powershell
# 1. Vérifier les données
cd backend
node check-database.js

# 2. Redémarrer le backend
npm run dev

# 3. Dans un autre terminal, vérifier
Invoke-WebRequest http://localhost:5000/api/mock/stats
```

## 💡 Prévention

Pour éviter les crashes futurs :

1. **Sauvegardes régulières**
   ```powershell
   # Exporter les données MongoDB
   mongodump --db supervive --out ./backups
   ```

2. **Logs**
   - Vérifier les logs du serveur
   - Surveiller les erreurs MongoDB

3. **Monitoring**
   - Vérifier régulièrement que les serveurs tournent
   - Utiliser un process manager (PM2) en production

