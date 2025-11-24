# 🚀 COMMANDES D'INSTALLATION - Supervive Platform

## ⚠️ PRÉREQUIS

Avant de commencer, installez :

1. **Node.js 20+** : https://nodejs.org/ (Télécharger et installer)
2. **MongoDB** :
   - Local : https://www.mongodb.com/try/download/community
   - OU Cloud (Atlas) : https://www.mongodb.com/cloud/atlas

**Vérifier l'installation** :
```powershell
node --version    # Doit afficher v20.x.x ou plus
npm --version     # Doit afficher 10.x.x ou plus
```

---

## 📝 ÉTAPE 1 : CONFIGURATION BACKEND

### 1.1 - Installer les dépendances

```powershell
cd c:\Users\anmoreau\projetTRUESV\backend
npm install
```

### 1.2 - Créer le fichier .env

Créez le fichier `c:\Users\anmoreau\projetTRUESV\backend\.env` avec ce contenu :

```env
PORT=5000
NODE_ENV=development

# MongoDB Local (si vous avez installé MongoDB en local)
MONGODB_URI=mongodb://localhost:27017/supervive

# OU MongoDB Atlas (si vous utilisez le cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/supervive

JWT_SECRET=supervive-secret-key-change-in-production-2024
JWT_EXPIRE=7d

CLIENT_URL=http://localhost:5173

# Optionnel - Cloudinary (pour upload logos)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optionnel - Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=

# Future API Supervive
SUPERVISE_API_URL=
SUPERVISE_API_KEY=
```

### 1.3 - Remplir la base de données avec des données de test

```powershell
cd c:\Users\anmoreau\projetTRUESV\backend
npm run seed
```

**✅ Cela créera :**
- 7 utilisateurs (1 admin, 6 joueurs)
- 3 équipes complètes
- 5 héros/légendes
- 1 tournoi avec 16 équipes
- Plusieurs scrims
- Annonces et listings

**Compte admin créé :**
- Email : `admin@supervive.gg`
- Password : `Admin123!`

### 1.4 - Démarrer le serveur backend

```powershell
cd c:\Users\anmoreau\projetTRUESV\backend
npm run dev
```

**✅ Le serveur démarre sur** : http://localhost:5000

Vous devriez voir :
```
Server running on port 5000
MongoDB Connected: localhost
```

**⚠️ Laissez ce terminal ouvert !**

---

## 📝 ÉTAPE 2 : CONFIGURATION FRONTEND

### 2.1 - Installer les dépendances

**Ouvrez un NOUVEAU terminal PowerShell** (gardez le backend qui tourne) :

```powershell
cd c:\Users\anmoreau\projetTRUESV\frontend
npm install
```

### 2.2 - Créer le fichier .env

Créez le fichier `c:\Users\anmoreau\projetTRUESV\frontend\.env` avec ce contenu :

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 2.3 - Démarrer le serveur frontend

```powershell
cd c:\Users\anmoreau\projetTRUESV\frontend
npm run dev
```

**✅ L'application démarre sur** : http://localhost:5173

Vous devriez voir :
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🎮 ÉTAPE 3 : TESTER L'APPLICATION

### 3.1 - Ouvrir l'application

Ouvrez votre navigateur et allez sur :

**http://localhost:5173**

### 3.2 - Se connecter

Utilisez le compte admin créé par le seed :

- **Email** : `admin@supervive.gg`
- **Password** : `Admin123!`

### 3.3 - Explorer les sections

- **Teams** - Voir les 3 équipes (Apex Legends, Storm Chasers, Victory Royale)
- **Scrims** - Voir les scrims programmés
- **Tournaments** - Voir le tournoi "Supervive Open #1"
- **Stats** - Voir les leaderboards (classement ELO)
- **Mercato** - Voir les annonces LFT/LFP
- **Profile** - Voir votre profil
- **Admin** - Dashboard admin (uniquement pour admin)

---

## 🧪 ÉTAPE 4 : TESTER L'API

### Option A - Avec le navigateur

Ouvrez directement ces URLs :

- http://localhost:5000/api/teams - Liste des équipes
- http://localhost:5000/api/stats/leaderboard?type=teams&metric=elo - Classement

### Option B - Avec PowerShell (curl)

```powershell
# Login
Invoke-RestMethod -Uri http://localhost:5000/api/auth/login -Method POST -ContentType "application/json" -Body '{"email":"admin@supervive.gg","password":"Admin123!"}'

# Liste des équipes
Invoke-RestMethod -Uri http://localhost:5000/api/teams -Method GET

# Leaderboard
Invoke-RestMethod -Uri "http://localhost:5000/api/stats/leaderboard?type=teams&metric=elo" -Method GET
```

---

## 📊 DONNÉES DISPONIBLES APRÈS LE SEED

### Utilisateurs
```
admin@supervive.gg     → Admin    → Password: Admin123!
captain1@supervive.gg  → Captain  → Password: Player123!
captain2@supervive.gg  → Captain  → Password: Player123!
captain3@supervive.gg  → Captain  → Password: Player123!
+ 3 autres joueurs
```

### Équipes
```
1. Apex Legends [APEX]     - ELO: 1250 - Region: EU
2. Storm Chasers [STRM]    - ELO: 1180 - Region: NA
3. Victory Royale [VR]     - ELO: 1120 - Region: ASIA
```

### Tournoi
```
Supervive Open #1
- Format: 5 games
- 16 teams
- Prize pool: 10,000€
- Points: Placement + Kills
```

---

## 🔄 COMMANDES UTILES

### Redémarrer le backend
```powershell
cd c:\Users\anmoreau\projetTRUESV\backend
npm run dev
```

### Redémarrer le frontend
```powershell
cd c:\Users\anmoreau\projetTRUESV\frontend
npm run dev
```

### Réinitialiser la base de données
```powershell
cd c:\Users\anmoreau\projetTRUESV\backend
npm run seed
```

### Build frontend pour production
```powershell
cd c:\Users\anmoreau\projetTRUESV\frontend
npm run build
```

---

## 🐛 RÉSOLUTION DE PROBLÈMES

### Erreur : "npm : The term 'npm' is not recognized"
**Cause** : Node.js n'est pas installé ou pas dans le PATH

**Solution** :
1. Installez Node.js depuis https://nodejs.org/
2. Redémarrez votre terminal PowerShell
3. Vérifiez : `node --version`

---

### Erreur : "MongoNetworkError: connect ECONNREFUSED"
**Cause** : MongoDB n'est pas démarré

**Solution MongoDB Local** :
1. Ouvrez "Services" Windows
2. Cherchez "MongoDB Server"
3. Cliquez "Démarrer"

**Solution MongoDB Atlas** :
1. Vérifiez votre connection string dans `.env`
2. Vérifiez que votre IP est dans la whitelist Atlas
3. Vérifiez username/password

---

### Erreur : "Error: Cannot find module 'express'"
**Cause** : Dépendances non installées

**Solution** :
```powershell
cd c:\Users\anmoreau\projetTRUESV\backend
npm install
```

---

### Erreur : "Port 5000 is already in use"
**Cause** : Un autre processus utilise le port 5000

**Solution 1** - Changer le port :
Éditez `backend\.env` :
```env
PORT=5001
```

**Solution 2** - Tuer le processus :
```powershell
# Trouver le processus
netstat -ano | findstr :5000

# Tuer le processus (remplacez <PID> par le numéro trouvé)
taskkill /PID <PID> /F
```

---

### Erreur TypeScript dans le frontend
**Cause** : Normal avant `npm install`

**Solution** :
```powershell
cd c:\Users\anmoreau\projetTRUESV\frontend
npm install
```

Toutes les erreurs TypeScript disparaissent après installation.

---

### Le frontend ne se connecte pas au backend
**Vérifications** :
1. Le backend tourne sur http://localhost:5000
2. Le fichier `frontend\.env` contient :
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
3. Redémarrez le frontend après modification du .env

---

## 📞 FICHIERS À CONSULTER

- **GUIDE_COMPLET.md** - Guide détaillé complet (10+ pages)
- **RESUME_PROJET.md** - Résumé de tout ce qui a été créé
- **README.md** - Vue d'ensemble du projet
- **backend/README.md** - Documentation API backend
- **frontend/README.md** - Documentation frontend

---

## ✅ CHECKLIST D'INSTALLATION

```
☐ Node.js 20+ installé (vérifié avec node --version)
☐ MongoDB installé (local) OU compte Atlas créé (cloud)
☐ Backend : npm install exécuté
☐ Backend : fichier .env créé avec MONGODB_URI et JWT_SECRET
☐ Backend : npm run seed exécuté (données de test créées)
☐ Backend : npm run dev en cours (port 5000)
☐ Frontend : npm install exécuté
☐ Frontend : fichier .env créé avec VITE_API_URL
☐ Frontend : npm run dev en cours (port 5173)
☐ Application accessible sur http://localhost:5173
☐ Connexion réussie avec admin@supervive.gg / Admin123!
```

---

## 🎯 PROCHAINES ÉTAPES

Après l'installation :

1. **Explorer l'API** - Testez les endpoints dans Postman
2. **Compléter le frontend** - Ajoutez les composants UI manquants
3. **Installer shadcn/ui** - Pour les composants UI
4. **Ajouter les graphiques** - Recharts pour les stats
5. **Intégrer Socket.io** - Pour le temps réel
6. **Déployer** - Heroku (backend) + Vercel (frontend)

---

**🚀 Installation terminée ? L'application est prête à être utilisée !**

**Compte de test** : `admin@supervive.gg` / `Admin123!`
