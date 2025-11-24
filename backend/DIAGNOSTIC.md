# 🔍 Diagnostic - Frontend sans données

## ✅ Vérifications effectuées

### Base de données MongoDB
- ✅ **MongoDB accessible**
- ✅ **8 utilisateurs** présents
- ✅ **3 équipes** présentes  
- ✅ **1 tournoi** présent
- ✅ **1 scrim** présent
- ✅ **Toutes les données sont sauvegardées**

### Problème identifié
- ❌ **Backend non accessible** sur `http://localhost:5000`
- ✅ Frontend accessible sur `http://localhost:5173`
- ⚠️  Le frontend ne peut pas récupérer les données car le backend ne répond pas

## 🔧 Solution

### 1. Redémarrer le backend

**Dans un terminal PowerShell:**
```powershell
cd backend
npm run dev
```

**OU utiliser le script:**
```powershell
cd backend
.\start-server.ps1
```

### 2. Vérifier que le backend répond

**Test rapide:**
```powershell
Invoke-WebRequest http://localhost:5000/api/mock/stats
```

**OU dans un navigateur:**
```
http://localhost:5000/api/mock/stats
```

### 3. Vérifier les endpoints de données

```powershell
# Teams
Invoke-WebRequest http://localhost:5000/api/teams

# Tournaments  
Invoke-WebRequest http://localhost:5000/api/tournaments

# Users
Invoke-WebRequest http://localhost:5000/api/users
```

## 🐛 Problèmes courants

### Port 5000 déjà utilisé

```powershell
# Trouver le processus
netstat -ano | findstr :5000

# Tuer le processus (remplacer PID)
Stop-Process -Id <PID> -Force
```

### MongoDB non démarré

```powershell
# Vérifier le service
Get-Service MongoDB

# Démarrer si arrêté
Start-Service MongoDB
```

### Erreurs CORS

Si vous voyez des erreurs CORS dans la console du navigateur:
- Vérifier que `CLIENT_URL=http://localhost:5173` est dans `.env`
- Redémarrer le backend après modification

## 📝 Checklist de récupération

1. [ ] ✅ Vérifier MongoDB (données présentes)
2. [ ] ⏳ Redémarrer le backend
3. [ ] ⏳ Vérifier `http://localhost:5000/api/mock/stats`
4. [ ] ⏳ Vérifier `http://localhost:5000/api/teams`
5. [ ] ⏳ Vérifier le frontend `http://localhost:5173`
6. [ ] ⏳ Vérifier la console du navigateur (F12) pour les erreurs

## 🚀 Commandes rapides

```powershell
# 1. Vérifier les données
cd backend
node check-database.js

# 2. Redémarrer le backend
npm run dev

# 3. Tester l'API
Invoke-WebRequest http://localhost:5000/api/teams
```

## 💡 Note importante

**Les données ne sont PAS perdues !** Elles sont dans MongoDB. Le problème est que le backend ne répond pas, donc le frontend ne peut pas les récupérer.

Une fois le backend redémarré, toutes les données réapparaîtront dans le frontend.

