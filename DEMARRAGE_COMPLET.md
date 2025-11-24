# 🚀 Démarrage complet du système

## ✅ Serveurs redémarrés !

Deux fenêtres PowerShell ont été ouvertes :

1. **Backend** - Port 5000
2. **Frontend** - Port 5173

## 📋 Vérification

### Backend
Attendez de voir dans la fenêtre PowerShell :
```
MongoDB connected
Server running on port 5000
```

Puis testez dans votre navigateur :
```
http://localhost:5000/api/teams
```

Vous devriez voir vos 3 équipes en JSON.

### Frontend
Attendez de voir dans la fenêtre PowerShell :
```
VITE ready in XXX ms
Local: http://localhost:5173
```

Puis ouvrez :
```
http://localhost:5173
```

## 🔄 Si ça ne fonctionne toujours pas

### Vérifier MongoDB
```powershell
# Vérifier le service
Get-Service MongoDB

# Démarrer si arrêté
Start-Service MongoDB
```

### Vérifier les ports
```powershell
# Port 5000 (backend)
netstat -ano | findstr :5000

# Port 5173 (frontend)
netstat -ano | findstr :5173
```

### Redémarrer manuellement

**Backend:**
```powershell
cd C:\Users\antoi\Desktop\projetTRUESV\backend
npm run dev
```

**Frontend:**
```powershell
cd C:\Users\antoi\Desktop\projetTRUESV\frontend
npm run dev
```

## 💡 Important

**Vos données sont sauvegardées dans MongoDB !**

Une fois les serveurs démarrés, toutes vos données réapparaîtront dans le frontend.

## 📝 Checklist

- [ ] Backend démarré (fenêtre PowerShell avec "Server running")
- [ ] Frontend démarré (fenêtre PowerShell avec "VITE ready")
- [ ] Test backend: http://localhost:5000/api/teams
- [ ] Test frontend: http://localhost:5173
- [ ] Données visibles dans le frontend

