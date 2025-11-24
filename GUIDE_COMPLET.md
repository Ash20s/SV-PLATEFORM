# 🎮 Supervive Competitive Platform - Guide Complet

## ✅ Statut du Projet

### Backend - ✅ 100% Complété
- ✅ Structure complète (config, models, controllers, routes, middlewares, services)
- ✅ Tous les modèles adaptés au format Battle Royale
- ✅ Système d'authentification JWT complet
- ✅ Protection RBAC (Role-Based Access Control)
- ✅ Validation Zod sur tous les endpoints
- ✅ Services de calcul statistiques BR (ELO, points, placements)
- ✅ API abstraction layer pour future API Supervive
- ✅ Script de seed avec données de test réalistes
- ✅ Socket.io configuré pour temps réel
- ✅ Middleware de sécurité (Helmet, CORS, Rate Limiter)

### Frontend - ⚠️ 70% Complété
- ✅ Structure Vite + React + TypeScript
- ✅ Tous les types TypeScript définis
- ✅ Services API (axios avec intercepteurs JWT)
- ✅ Stores Zustand (auth avec localStorage)
- ✅ Hooks TanStack Query (useTeams, useScrims, useStats, useAuth)
- ✅ Layout et navigation (Navbar avec liens)
- ✅ Routing complet (8 pages)
- ✅ Pages principales créées (structure basique)
- ⚠️ Composants UI à compléter (Cards, Modals, Forms)
- ⚠️ Graphiques Recharts à implémenter
- ⚠️ shadcn/ui à installer

---

## 📋 Prérequis à Installer

### 1. Node.js (Version 20 ou supérieure)

**Téléchargement** : https://nodejs.org/
- Téléchargez la version LTS (Long Term Support)
- Installez avec les options par défaut
- Redémarrez votre terminal après installation

**Vérification** :
```bash
node --version  # Devrait afficher v20.x.x ou supérieur
npm --version   # Devrait afficher 10.x.x ou supérieur
```

### 2. MongoDB (Base de données)

**Option A - MongoDB Local** (Recommandé pour développement)
- Téléchargez : https://www.mongodb.com/try/download/community
- Installez MongoDB Community Edition
- Démarrez le service MongoDB

**Option B - MongoDB Atlas** (Cloud - Gratuit)
- Créez un compte : https://www.mongodb.com/cloud/atlas/register
- Créez un cluster gratuit
- Récupérez votre connection string

### 3. Git (Optionnel - pour versioning)
- Téléchargez : https://git-scm.com/download/win
- Installez avec les options par défaut

---

## 🚀 Installation du Projet

### Étape 1 : Vérifier Node.js

Ouvrez un nouveau terminal PowerShell et vérifiez :
```bash
node --version
npm --version
```

Si ces commandes ne fonctionnent pas, installez Node.js d'abord.

### Étape 2 : Installer les dépendances Backend

```bash
cd c:\Users\anmoreau\projetTRUESV\backend
npm install
```

Cela installera :
- express (serveur web)
- mongoose (MongoDB ODM)
- jsonwebtoken, bcryptjs (authentification)
- socket.io (temps réel)
- zod (validation)
- helmet, cors, express-rate-limit (sécurité)
- cloudinary (uploads)
- nodemailer (emails)
- dotenv (variables d'environnement)
- nodemon (dev)

### Étape 3 : Configurer le Backend

Créez le fichier `c:\Users\anmoreau\projetTRUESV\backend\.env` :

```env
PORT=5000
NODE_ENV=development

# MongoDB - Choisissez l'option qui convient
# Option A - MongoDB Local
MONGODB_URI=mongodb://localhost:27017/supervive

# Option B - MongoDB Atlas (remplacez avec vos identifiants)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/supervive

# JWT - IMPORTANT : Changez ce secret !
JWT_SECRET=supervive-secret-key-change-in-production-2024
JWT_EXPIRE=7d

# URL du frontend
CLIENT_URL=http://localhost:5173

# Cloudinary (Optionnel - pour les logos d'équipes)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (Optionnel - pour les notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=

# Future API Supervive (à configurer plus tard)
SUPERVISE_API_URL=
SUPERVISE_API_KEY=
```

### Étape 4 : Seed la Base de Données

```bash
cd c:\Users\anmoreau\projetTRUESV\backend
npm run seed
```

✅ Cela créera des données de test :
- 7 utilisateurs (dont 1 admin : `admin@supervive.gg` / `Admin123!`)
- 3 équipes avec statistiques Battle Royale
- 5 héros/légendes
- 1 tournoi avec système de points
- Plusieurs scrims
- Annonces et listings LFT/LFP

### Étape 5 : Démarrer le Backend

```bash
cd c:\Users\anmoreau\projetTRUESV\backend
npm run dev
```

✅ Le serveur démarre sur `http://localhost:5000`

Vous devriez voir :
```
Server running on port 5000
MongoDB Connected: localhost
```

### Étape 6 : Installer les dépendances Frontend

**Ouvrez un NOUVEAU terminal** (laissez le backend tourner) :

```bash
cd c:\Users\anmoreau\projetTRUESV\frontend
npm install
```

Cela installera :
- react, react-dom (framework)
- react-router-dom (routing)
- @tanstack/react-query (data fetching)
- zustand (state management)
- tailwindcss (CSS)
- axios (HTTP client)
- react-hook-form, zod (formulaires)
- recharts (graphiques)
- lucide-react (icônes)
- socket.io-client (temps réel)
- vite (build tool)
- typescript (types)

### Étape 7 : Configurer le Frontend

Créez le fichier `c:\Users\anmoreau\projetTRUESV\frontend\.env` :

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Étape 8 : Démarrer le Frontend

```bash
cd c:\Users\anmoreau\projetTRUESV\frontend
npm run dev
```

✅ L'application démarre sur `http://localhost:5173`

Vous devriez voir :
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Étape 9 : Ouvrir l'Application

Ouvrez votre navigateur et allez sur : **http://localhost:5173**

---

## 🎯 Test de l'Application

### 1. Se Connecter avec le compte Admin

**Email** : `admin@supervive.gg`  
**Password** : `Admin123!`

### 2. Explorer les sections

- **Teams** : Voir les 3 équipes créées (Apex Legends, Storm Chasers, Victory Royale)
- **Scrims** : Voir les scrims programmés
- **Tournaments** : Voir le tournoi "Supervive Open #1"
- **Stats** : Voir les leaderboards (classement ELO)
- **Mercato** : Voir les annonces LFT/LFP

### 3. Tester l'API directement

Avec Postman ou curl :

```bash
# Login
POST http://localhost:5000/api/auth/login
Body: {
  "email": "admin@supervive.gg",
  "password": "Admin123!"
}

# Récupérer les équipes
GET http://localhost:5000/api/teams

# Récupérer le leaderboard
GET http://localhost:5000/api/stats/leaderboard?type=teams&metric=elo
```

---

## 📊 Données Créées par le Seed

### Utilisateurs
- **admin@supervive.gg** (Admin) - Password: `Admin123!`
- **captain1@supervive.gg** (Captain) - Password: `Player123!`
- **captain2@supervive.gg** (Captain) - Password: `Player123!`
- **captain3@supervive.gg** (Captain) - Password: `Player123!`
- 3 autres joueurs

### Équipes
1. **Apex Legends** [APEX]
   - Stats : ELO 1250, 45 games, 15 victoires, 25 top3
   
2. **Storm Chasers** [STRM]
   - Stats : ELO 1180, 38 games, 10 victoires, 18 top3
   
3. **Victory Royale** [VR]
   - Stats : ELO 1120, 42 games, 8 victoires, 20 top3

### Tournoi
- **Supervive Open #1**
- Système de points : Placement + Kills
- 5 games
- 16 équipes inscrites
- Prizepool : 10,000€

### Héros/Légendes
- Wraith (Mobility)
- Lifeline (Support)
- Bloodhound (Recon)
- Bangalore (Assault)
- Gibraltar (Tank)

---

## 🎮 Système Battle Royale Expliqué

### Points de Placement (par game)
```
🥇 1st  : 12 points
🥈 2nd  : 9 points
🥉 3rd  : 7 points
   4th  : 5 points
   5-6  : 4 points
   7-8  : 3 points
   9-12 : 2 points
   13-16: 1 point
```

### Points de Kills
```
1 kill = 1 point
```

### Calcul du Score Total
```
Score Final = Points de Placement + Points de Kills

Exemple :
- Équipe finit 2ème (9 pts) avec 8 kills (8 pts)
- Score Total = 9 + 8 = 17 points
```

### Calcul ELO
```
ELO = Base (1000) + (Placement moyen × 20) + (Kills par game × 5)

Exemple :
- Placement moyen : 5ème
- Kills par game : 6
- ELO = 1000 + (5 × 20) + (6 × 5) = 1000 + 100 + 30 = 1130
```

### Statistiques Trackées
- **Placements** : top1, top3, top5, top10
- **Combat** : kills, deaths, assists, knockdowns, revives
- **KDA** : (kills + assists) / deaths
- **Dégâts** : total, moyenne par game, record
- **Héros** : stats par personnage joué

---

## 🔧 Scripts Disponibles

### Backend
```bash
npm run dev      # Démarrage développement (nodemon - auto-reload)
npm start        # Démarrage production
npm run seed     # Remplir la base de données
```

### Frontend
```bash
npm run dev      # Démarrage développement (Vite HMR)
npm run build    # Build pour production
npm run preview  # Prévisualiser le build
npm run lint     # Linter le code TypeScript
```

---

## 🐛 Résolution de Problèmes

### ❌ "npm: The term 'npm' is not recognized"
**Solution** : Node.js n'est pas installé ou pas dans le PATH
1. Installez Node.js depuis https://nodejs.org/
2. Redémarrez votre terminal
3. Vérifiez : `node --version`

### ❌ "MongoNetworkError: connect ECONNREFUSED"
**Solution** : MongoDB n'est pas démarré
- **Local** : Démarrez le service MongoDB
- **Atlas** : Vérifiez votre connection string et whitelist IP

### ❌ "Error: Cannot find module 'express'"
**Solution** : Dépendances non installées
```bash
cd backend
npm install
```

### ❌ "JWT must be provided"
**Solution** : Token JWT manquant
- Connectez-vous d'abord pour obtenir un token
- Le token est automatiquement stocké dans localStorage

### ❌ "Port 5000 already in use"
**Solution** : Le port est occupé
- Changez le port dans `.env` (ex: `PORT=5001`)
- Ou arrêtez l'autre processus

### ❌ Erreurs TypeScript dans le frontend
**Solution** : Normale avant `npm install`
- Les erreurs disparaissent après installation des dépendances
- Executez `npm install` dans le dossier frontend

---

## 📁 Structure Complète du Projet

```
projetTRUESV/
│
├── INSTALLATION.md           # Ce fichier
├── README.md                 # Vue d'ensemble
│
├── backend/                  # ✅ Backend complet (100%)
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js      # Config MongoDB
│   │   │   ├── auth.js          # Config JWT
│   │   │   └── cloudinary.js    # Config Cloudinary
│   │   │
│   │   ├── models/              # Modèles Mongoose (Battle Royale)
│   │   │   ├── User.js          # Utilisateurs
│   │   │   ├── Team.js          # Équipes
│   │   │   ├── Player.js        # Joueurs
│   │   │   ├── PlayerStats.js   # Stats joueur (top1/3/5/10, KDA, damage)
│   │   │   ├── TeamStats.js     # Stats équipe (placements, ELO)
│   │   │   ├── Scrim.js         # Scrims (lobbies multi-équipes)
│   │   │   ├── Tournament.js    # Tournois (système points)
│   │   │   ├── Match.js         # Matchs (résultats BR)
│   │   │   ├── Announcement.js  # Annonces
│   │   │   ├── Listing.js       # LFT/LFP
│   │   │   └── Hero.js          # Héros/Légendes
│   │   │
│   │   ├── controllers/         # Logique métier
│   │   │   ├── authController.js       # Auth (register/login/JWT)
│   │   │   ├── teamController.js       # CRUD équipes + roster
│   │   │   ├── scrimController.js      # Gestion scrims BR
│   │   │   ├── tournamentController.js # Gestion tournois
│   │   │   ├── statsController.js      # Statistiques
│   │   │   ├── announcementController.js
│   │   │   └── listingController.js
│   │   │
│   │   ├── routes/              # Routes Express
│   │   │   ├── auth.routes.js
│   │   │   ├── teams.routes.js
│   │   │   ├── scrims.routes.js
│   │   │   ├── tournaments.routes.js
│   │   │   ├── stats.routes.js
│   │   │   ├── announcements.routes.js
│   │   │   └── listings.routes.js
│   │   │
│   │   ├── middlewares/         # Middlewares
│   │   │   ├── auth.middleware.js    # JWT verification
│   │   │   ├── rbac.middleware.js    # Role-based access
│   │   │   ├── validator.middleware.js # Validation Zod
│   │   │   └── rateLimiter.js        # Rate limiting
│   │   │
│   │   ├── services/            # Services
│   │   │   ├── statsCalculator.js    # Calculs BR (ELO, points)
│   │   │   ├── superviveAPI.js       # Abstraction API future
│   │   │   ├── notificationService.js
│   │   │   ├── emailService.js
│   │   │   └── matchmakingService.js
│   │   │
│   │   └── utils/               # Utilitaires
│   │       ├── validators.js
│   │       ├── errorHandler.js
│   │       ├── helpers.js
│   │       └── validationSchemas.js  # Schémas Zod
│   │
│   ├── server.js                # Point d'entrée Express
│   ├── seed.js                  # Script de seed
│   ├── package.json
│   ├── .gitignore
│   └── README.md
│
└── frontend/                    # ⚠️ Frontend (70% complété)
    ├── src/
    │   ├── components/
    │   │   ├── layout/          # ✅ Layout complet
    │   │   │   ├── Layout.tsx
    │   │   │   ├── Navbar.tsx
    │   │   │   └── Footer.tsx
    │   │   │
    │   │   ├── common/          # ⚠️ À compléter
    │   │   ├── teams/           # ⚠️ À compléter
    │   │   ├── scrims/          # ⚠️ À compléter
    │   │   ├── tournaments/     # ⚠️ À compléter
    │   │   ├── stats/           # ⚠️ À compléter
    │   │   └── listings/        # ⚠️ À compléter
    │   │
    │   ├── pages/               # ✅ Pages créées (basique)
    │   │   ├── Home/
    │   │   ├── Teams/
    │   │   ├── Scrims/
    │   │   ├── Tournaments/
    │   │   ├── Stats/
    │   │   ├── Mercato/
    │   │   ├── Profile/
    │   │   └── Admin/
    │   │
    │   ├── services/            # ✅ Services API complets
    │   │   ├── api.ts               # Axios + intercepteurs
    │   │   ├── authService.ts
    │   │   ├── teamService.ts
    │   │   ├── scrimService.ts
    │   │   ├── tournamentService.ts
    │   │   ├── statsService.ts
    │   │   └── listingService.ts
    │   │
    │   ├── stores/              # ✅ Zustand stores
    │   │   └── authStore.ts         # Auth + localStorage
    │   │
    │   ├── hooks/               # ✅ React Query hooks
    │   │   ├── useAuth.ts
    │   │   ├── useTeams.ts
    │   │   ├── useScrims.ts
    │   │   └── useStats.ts
    │   │
    │   ├── types/               # ✅ TypeScript types complets
    │   │   └── index.ts             # Tous les types BR
    │   │
    │   ├── utils/               # ✅ Helpers
    │   │   └── helpers.ts           # formatDate, formatKDA, etc.
    │   │
    │   ├── App.tsx              # ✅ Routes
    │   ├── main.tsx             # ✅ Entry point
    │   └── index.css            # ✅ Tailwind + dark mode
    │
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .gitignore
    └── README.md
```

---

## 🔮 Prochaines Étapes

### Compléter le Frontend
1. **Installer shadcn/ui** composants
2. **Créer composants UI** : Cards, Modals, Forms, Tables
3. **Implémenter formulaires** avec React Hook Form
4. **Ajouter graphiques** avec Recharts
5. **Intégrer Socket.io** pour temps réel
6. **Protéger routes** admin/captain

### Intégration API Supervive (Future)
Quand l'API officielle sera disponible, modifier :
- `backend/src/services/superviveAPI.js`
  - `normalizePlayerStats()` - Mapper stats API
  - `normalizeMatch()` - Mapper matchs
  - `syncPlayerData()` - Sync auto

### Déploiement
1. **Backend** : Heroku, Render, Railway, ou VPS
2. **Frontend** : Vercel, Netlify, ou Cloudflare Pages
3. **Database** : MongoDB Atlas (cloud)
4. **Variables d'environnement** : Configurer en production

---

## 📞 Support

### Documentation Backend
Voir `backend/README.md` pour :
- Liste complète des endpoints API
- Exemples de requêtes
- Détails du système Battle Royale

### Documentation Frontend
Voir `frontend/README.md` pour :
- Structure des composants
- Hooks disponibles
- Configuration Tailwind

### Fichiers de Configuration
- Backend : `backend/.env`
- Frontend : `frontend/.env`
- Seed : `backend/seed.js`

---

**Projet créé avec ❤️ pour la communauté Supervive Battle Royale**

🎯 **Objectif** : Plateforme complète pour gérer la scène compétitive  
🏆 **Format** : Battle Royale avec système de points (placement + kills)  
🚀 **Stack** : MERN (MongoDB, Express, React, Node.js) + TypeScript  
