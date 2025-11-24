# 🚀 INSTRUCTIONS POST-INSTALLATION

## ⚠️ IMPORTANT - Redémarrer le terminal

Node.js et MongoDB sont installés, mais vous devez **redémarrer VS Code** (ou ouvrir un nouveau terminal PowerShell) pour que Windows reconnaisse les commandes `node` et `npm`.

---

## 📝 ÉTAPES À SUIVRE

### 1️⃣ Redémarrer VS Code
1. Fermez VS Code complètement
2. Réouvrez VS Code
3. Ouvrez un nouveau terminal PowerShell

OU dans VS Code actuel :
1. Cliquez sur l'icône "poubelle" 🗑️ dans le terminal
2. Ouvrez un nouveau terminal (Ctrl + ù)

### 2️⃣ Vérifier que Node.js fonctionne

```powershell
node --version
npm --version
```

Vous devriez voir :
```
v20.x.x
10.x.x
```

### 3️⃣ Renommer les fichiers .env

J'ai créé les fichiers de configuration :
- `backend\.env.local`
- `frontend\.env.local`

**Renommez-les en supprimant le ".local"** :

```powershell
# Dans le terminal PowerShell
cd c:\Users\anmoreau\projetTRUESV

# Renommer backend .env
Move-Item backend\.env.local backend\.env -Force

# Renommer frontend .env
Move-Item frontend\.env.local frontend\.env -Force
```

### 4️⃣ Installer les dépendances Backend

```powershell
cd c:\Users\anmoreau\projetTRUESV\backend
npm install
```

Cela va installer ~50 packages (Express, MongoDB, JWT, Socket.io, etc.)

### 5️⃣ Vérifier que MongoDB fonctionne

```powershell
# Vérifier le service MongoDB
Get-Service MongoDB
```

Si le service n'est pas "Running" :

```powershell
Start-Service MongoDB
```

### 6️⃣ Remplir la base de données (Seed)

```powershell
cd c:\Users\anmoreau\projetTRUESV\backend
npm run seed
```

✅ Cela créera :
- 7 utilisateurs (dont `admin@supervive.gg` / `Admin123!`)
- 3 équipes complètes
- 5 héros/légendes
- 1 tournoi
- Scrims et listings

### 7️⃣ Démarrer le Backend

```powershell
cd c:\Users\anmoreau\projetTRUESV\backend
npm run dev
```

✅ Le serveur démarre sur **http://localhost:5000**

**Laissez ce terminal ouvert !**

### 8️⃣ Installer les dépendances Frontend

**Ouvrez un NOUVEAU terminal** (gardez le backend qui tourne) :

```powershell
cd c:\Users\anmoreau\projetTRUESV\frontend
npm install
```

Cela va installer ~200 packages (React, Vite, TanStack Query, Zustand, Tailwind, etc.)

### 9️⃣ Démarrer le Frontend

```powershell
cd c:\Users\anmoreau\projetTRUESV\frontend
npm run dev
```

✅ L'application démarre sur **http://localhost:5173**

### 🔟 Ouvrir l'application

Dans votre navigateur : **http://localhost:5173**

**Se connecter avec** :
- Email : `admin@supervive.gg`
- Password : `Admin123!`

---

## 📊 Ce qui sera disponible

### Équipes créées
- **Apex Legends** [APEX] - ELO 1250
- **Storm Chasers** [STRM] - ELO 1180
- **Victory Royale** [VR] - ELO 1120

### Sections disponibles
- **Teams** - Voir les équipes
- **Scrims** - Voir les scrims
- **Tournaments** - Voir le tournoi "Supervive Open #1"
- **Stats** - Leaderboards ELO
- **Mercato** - Listings LFT/LFP
- **Profile** - Votre profil
- **Admin** - Dashboard admin

---

## 🐛 Si vous avez des erreurs

### "npm: The term 'npm' is not recognized"
→ Vous n'avez pas redémarré le terminal. Fermez et rouvrez VS Code.

### "MongoNetworkError: connect ECONNREFUSED"
→ MongoDB n'est pas démarré :
```powershell
Start-Service MongoDB
```

### "Port 5000 is already in use"
→ Changez le port dans `backend\.env` :
```env
PORT=5001
```

---

## 📞 Aide

Tous les détails sont dans :
- **COMMANDES_INSTALLATION.md** - Toutes les commandes
- **GUIDE_COMPLET.md** - Guide détaillé
- **RESUME_PROJET.md** - Résumé du projet

---

**🎯 Prochaine étape : Redémarrez VS Code, puis exécutez les commandes ci-dessus !**
