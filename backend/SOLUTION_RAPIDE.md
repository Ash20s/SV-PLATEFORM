# 🚨 Solution rapide - Frontend sans données

## ✅ BONNE NOUVELLE : Vos données sont sauvegardées !

Vérification effectuée :
- ✅ **8 utilisateurs** dans MongoDB
- ✅ **3 équipes** dans MongoDB
- ✅ **1 tournoi** dans MongoDB
- ✅ **1 scrim** dans MongoDB
- ✅ **Toutes les données sont intactes**

## 🔴 PROBLÈME : Le backend ne répond pas

Le frontend ne peut pas afficher les données car le backend n'est pas accessible.

## 🔧 SOLUTION : Redémarrer le backend

### Étape 1 : Ouvrir un nouveau terminal PowerShell

### Étape 2 : Aller dans le dossier backend
```powershell
cd C:\Users\antoi\Desktop\projetTRUESV\backend
```

### Étape 3 : Démarrer le serveur
```powershell
npm run dev
```

### Étape 4 : Vérifier que ça fonctionne

Vous devriez voir :
```
MongoDB connected
Server running on port 5000
```

### Étape 5 : Tester dans le navigateur

Ouvrez :
```
http://localhost:5000/api/teams
```

Vous devriez voir vos 3 équipes en JSON.

### Étape 6 : Recharger le frontend

Allez sur `http://localhost:5173` et rechargez la page (F5).

## ⚠️ Si le backend ne démarre pas

### Erreur MongoDB
```
MongoDB connection error
```

**Solution :** Démarrer MongoDB
```powershell
# Vérifier le service
Get-Service MongoDB

# Démarrer si arrêté
Start-Service MongoDB
```

### Erreur Port 5000 utilisé
```
Port 5000 already in use
```

**Solution :** Tuer le processus
```powershell
# Trouver le processus
netstat -ano | findstr :5000

# Tuer (remplacer PID par le numéro trouvé)
Stop-Process -Id <PID> -Force
```

## 📋 Checklist

- [ ] Backend démarré (`npm run dev` dans le dossier backend)
- [ ] Message "Server running on port 5000" visible
- [ ] `http://localhost:5000/api/teams` retourne des données
- [ ] Frontend rechargé (`http://localhost:5173`)

## 💡 Résumé

**Vos données ne sont PAS perdues !** Elles sont dans MongoDB.

Le problème est simplement que le backend ne tourne pas, donc le frontend ne peut pas les récupérer.

**Une fois le backend redémarré, toutes vos données réapparaîtront dans le frontend.**

