# 🎮 Supervive Competitive Platform

Plateforme web professionnelle complète pour la scène compétitive de Supervise (Battle Royale).

## 📋 Stack Technique

### Backend
- **Runtime**: Node.js 20+ avec Express.js
- **Base de données**: MongoDB + Mongoose ODM
- **Authentification**: JWT + bcrypt
- **Validation**: Zod schemas
- **Temps réel**: Socket.io
- **Upload**: Cloudinary
- **Sécurité**: Helmet, CORS, Rate Limiter

### Frontend
- **Build**: Vite
- **Framework**: React 18 avec TypeScript
- **Routing**: React Router v6
- **État serveur**: TanStack Query (React Query)
- **État client**: Zustand
- **UI**: Tailwind CSS + shadcn/ui
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React
- **Temps réel**: Socket.io-client

## 🚀 Installation Rapide

### 1. Installation Backend

```bash
cd backend
npm install
```

### 2. Configuration Backend

Créez un fichier `.env` dans `backend/` :

```env
PORT=5000
NODE_ENV=development

# MongoDB - Choisissez l'une des options
MONGODB_URI=mongodb://localhost:27017/supervive
# OU pour MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/supervive

JWT_SECRET=votre-cle-secrete-jwt-changez-moi
JWT_EXPIRE=7d

CLIENT_URL=http://localhost:5173

# Optionnel - Cloudinary (pour les logos d'équipes)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optionnel - Email (pour les notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=

# Future API Supervive
SUPERVISE_API_URL=
SUPERVISE_API_KEY=
```

### 3. Seed de la base de données (données de test)

```bash
cd backend
npm run seed
```

Cela créera :
- 7 utilisateurs (1 admin, 6 joueurs)
- 3 équipes complètes avec statistiques Battle Royale
- 5 héros/légendes
- 1 tournoi avec système de points
- Plusieurs scrims
- Annonces et listings LFT/LFP

**Compte admin de test :**
- Email: `admin@supervive.gg`
- Password: `Admin123!`

### 4. Démarrage Backend

```bash
cd backend
npm run dev
```

Le serveur démarre sur `http://localhost:5000`

### 5. Installation Frontend

```bash
cd frontend
npm install
```

### 6. Configuration Frontend

Créez un fichier `.env` dans `frontend/` :

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 7. Démarrage Frontend

```bash
cd frontend
npm run dev
```

L'application démarre sur `http://localhost:5173`

## 📁 Structure du Projet

```
projetTRUESV/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration (DB, Auth, Cloudinary)
│   │   ├── models/          # Modèles MongoDB (Battle Royale adaptés)
│   │   ├── controllers/     # Logique métier
│   │   ├── routes/          # Routes API
│   │   ├── middlewares/     # Auth, RBAC, Validation, Rate Limiting
│   │   ├── services/        # Services (Stats, API, Notifications)
│   │   └── utils/           # Helpers et validateurs
│   ├── seed.js              # Script de seed
│   ├── server.js            # Point d'entrée
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Composants React
    │   │   ├── layout/      # Layout, Navbar, Footer
    │   │   ├── common/      # Composants réutilisables
    │   │   ├── teams/       # Composants équipes
    │   │   ├── scrims/      # Composants scrims
    │   │   ├── tournaments/ # Composants tournois
    │   │   ├── stats/       # Composants statistiques
    │   │   └── listings/    # Composants mercato
    │   ├── pages/           # Pages (Home, Teams, Scrims, etc.)
    │   ├── services/        # Services API (axios)
    │   ├── stores/          # Stores Zustand
    │   ├── hooks/           # Hooks React Query
    │   ├── types/           # Types TypeScript
    │   ├── utils/           # Helpers
    │   ├── App.tsx          # Routes principales
    │   └── main.tsx         # Point d'entrée
    └── package.json
```

## 🎯 Fonctionnalités

### ✅ Implémentées (Backend + Frontend structure)

- **Authentification JWT** : Register, Login, Logout
- **Gestion d'équipes** : CRUD, roster management
- **Système de Scrims** : Lobbies multi-équipes, résultats BR
- **Tournois** : Système de points (placement + kills)
- **Statistiques BR** :
  - Placements (top1, top3, top5, top10)
  - KDA (Kills, Deaths, Assists)
  - Dégâts (total, moyenne, max)
  - Statistiques par héros
  - ELO dynamique
- **Mercato** : Listings LFT (Looking for Team) / LFP (Looking for Players)
- **Annonces** : Système d'annonces
- **API Abstraction Layer** : Prêt pour future API Supervive

### Battle Royale - Système de Points

**Points de Placement** (par game) :
- 🥇 1st: 12 pts
- 🥈 2nd: 9 pts
- 🥉 3rd: 7 pts
- 4th: 5 pts
- 5th-6th: 4 pts
- 7th-8th: 3 pts
- 9th-12th: 2 pts
- 13th-16th: 1 pt

**Points de Kills** : 1 point par kill

**Calcul ELO** : Basé sur placement + kills

## 🔌 API Endpoints Principaux

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Utilisateur courant

### Teams
- `GET /api/teams` - Liste des équipes
- `POST /api/teams` - Créer une équipe (auth)
- `PUT /api/teams/:id` - Modifier (captain)
- `POST /api/teams/:id/members` - Ajouter membre (captain)

### Scrims
- `GET /api/scrims` - Liste des scrims
- `POST /api/scrims` - Créer un scrim (captain)
- `PUT /api/scrims/:id/confirm` - Confirmer participation (captain)
- `PUT /api/scrims/:id/results` - Soumettre résultats (host)

### Tournaments
- `GET /api/tournaments` - Liste des tournois
- `POST /api/tournaments` - Créer tournoi (admin)
- `PUT /api/tournaments/:id/register` - Inscription équipe (captain)
- `PUT /api/tournaments/:id/results` - Soumettre résultats (admin)

### Stats
- `GET /api/stats/players/:id` - Stats joueur
- `GET /api/stats/teams/:id` - Stats équipe
- `GET /api/stats/leaderboard?type=teams&metric=elo` - Classement

### Listings (Mercato)
- `GET /api/listings?type=LFT` - Liste LFT/LFP
- `POST /api/listings` - Créer annonce (auth)

## 🔐 Rôles et Permissions

- **User** : Peut créer une équipe, rejoindre, voir stats
- **Captain** : Gère son équipe, crée scrims, inscrit aux tournois
- **Admin** : Gère tournois, annonces, modération

## 📊 Données de Seed

Le seed crée des données réalistes :
- **Teams** : "Apex Legends", "Storm Chasers", "Victory Royale"
- **Players** : Avec statistiques BR complètes (top1, KDA, damage)
- **Tournament** : "Supervive Open #1" avec 16 équipes
- **Heroes** : 5 personnages avec stats

## 🔮 Prochaines Étapes

### Frontend (en cours)
- [ ] Compléter les composants UI (Cards, Modals, Tables)
- [ ] Implémenter les pages détaillées
- [ ] Ajouter les formulaires avec React Hook Form
- [ ] Intégrer les graphiques Recharts
- [ ] Installer shadcn/ui components
- [ ] Implémenter Socket.io client

### Future API Supervive
Quand l'API officielle sera disponible, modifier `backend/src/services/superviveAPI.js` :
- `normalizePlayerStats()` - Mapper les stats API vers notre format
- `normalizeMatch()` - Mapper les matchs API
- `syncPlayerData()` - Synchronisation automatique

## 🛠️ Scripts Disponibles

### Backend
```bash
npm run dev      # Démarrage en mode développement (nodemon)
npm start        # Démarrage en production
npm run seed     # Seed de la base de données
```

### Frontend
```bash
npm run dev      # Démarrage serveur de dev (Vite)
npm run build    # Build production
npm run preview  # Prévisualiser le build
npm run lint     # Linter le code
```

## 📝 Notes Importantes

1. **MongoDB** : Assurez-vous que MongoDB est en cours d'exécution (local) ou utilisez MongoDB Atlas
2. **Port 5000** : Le backend utilise le port 5000 par défaut
3. **Port 5173** : Le frontend Vite utilise le port 5173 par défaut
4. **CORS** : Configuré pour accepter `http://localhost:5173`
5. **JWT Secret** : Changez le secret JWT en production !
6. **Battle Royale** : Tous les modèles sont adaptés au format BR (placement, kills, damage)

## 🐛 Troubleshooting

**Erreur MongoDB** : Vérifiez que MongoDB est démarré ou que votre URI Atlas est correcte

**Erreur CORS** : Vérifiez que `CLIENT_URL` dans `.env` backend correspond à l'URL frontend

**Erreur JWT** : Assurez-vous que `JWT_SECRET` est défini dans `.env`

**Module non trouvé** : Exécutez `npm install` dans backend et frontend

## 📧 Contact

Pour toute question sur l'intégration future de l'API Supervive, référez-vous au fichier `backend/src/services/superviveAPI.js`.

---

**Bon développement ! 🚀**
