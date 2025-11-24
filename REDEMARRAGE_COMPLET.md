# 🔄 Redémarrage complet effectué

## ✅ Actions effectuées

1. ✅ Tous les processus Node arrêtés
2. ✅ Ports 5000 et 5173 libérés
3. ✅ Backend redémarré (fenêtre PowerShell ouverte)
4. ✅ Frontend redémarré (fenêtre PowerShell ouverte)

## 🔍 Vérification

### Backend (Port 5000)
Dans la fenêtre PowerShell du backend, vous devriez voir :
```
✅ MongoDB connected
Server running on port 5000
✅ Keep-alive MongoDB activé
```

### Frontend (Port 5173)
Dans la fenêtre PowerShell du frontend, vous devriez voir :
```
VITE ready in XXX ms
Local: http://localhost:5173
```

## 🌐 Accès

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/teams

## ⚠️ Si les serveurs ne démarrent pas

1. Vérifiez les fenêtres PowerShell pour les erreurs
2. Vérifiez que MongoDB est démarré
3. Vérifiez que les ports ne sont pas utilisés par d'autres applications

## 💡 Commandes utiles

```powershell
# Vérifier les processus Node
Get-Process -Name node

# Vérifier les ports
netstat -ano | findstr ":5000 :5173"

# Tuer un processus sur un port
netstat -ano | findstr :5000
# Puis utiliser le PID pour: Stop-Process -Id <PID> -Force
```







