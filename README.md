# Supervive Competitive Platform

Plateforme web professionnelle complète pour la scène compétitive de Supervive (Battle Royale).

## 🎯 Stack Technique

**Backend** : Node.js + Express + MongoDB + JWT + Socket.io  
**Frontend** : React 18 + TypeScript + Vite + TanStack Query + Zustand + Tailwind CSS

## 📚 Documentation

- **[GUIDE_COMPLET.md](./GUIDE_COMPLET.md)** - Guide détaillé d'installation et utilisation
- **[backend/README.md](./backend/README.md)** - Documentation API Backend
- **[frontend/README.md](./frontend/README.md)** - Documentation Frontend

## ⚡ Quick Start

### Prérequis
- Node.js 20+ ([Télécharger](https://nodejs.org/))
- MongoDB ([Local](https://www.mongodb.com/try/download/community) ou [Atlas](https://www.mongodb.com/cloud/atlas))

### Installation

```bash
# Backend
cd backend
npm install
# Créer le fichier .env (voir GUIDE_COMPLET.md)
npm run seed    # Données de test
npm run dev     # Port 5000

# Frontend (nouveau terminal)
cd frontend
npm install
# Créer le fichier .env (voir GUIDE_COMPLET.md)
npm run dev     # Port 5173
```

### Compte de Test
Email: `admin@supervive.gg`  
Password: `Admin123!`

## ✨ Fonctionnalités

- ✅ Authentification JWT (Register/Login)
- ✅ Gestion d'équipes (CRUD + Roster)
- ✅ Système de Scrims (Lobbies multi-équipes)
- ✅ Tournois avec système de points BR
- ✅ Statistiques complètes (Placements, KDA, Dégâts, ELO)
- ✅ Mercato (LFT/LFP - Looking for Team/Players)
- ✅ Annonces
- ✅ API Abstraction Layer (prêt pour API Supervive future)

## 🎮 Battle Royale

### Système de Points
- **Placement** : 1st=12pts, 2nd=9pts, 3rd=7pts, 4th=5pts...
- **Kills** : 1pt par kill
- **ELO** : Calculé sur placement + kills

### Stats Trackées
- Placements : top1, top3, top5, top10
- Combat : kills, deaths, assists, knockdowns
- Dégâts : total, moyenne, record
- Par héros/légende

## 📁 Structure

```
projetTRUESV/
├── backend/          # ✅ Node.js + Express + MongoDB (100% complet)
│   ├── src/
│   │   ├── models/       # Modèles BR (PlayerStats, TeamStats, etc.)
│   │   ├── controllers/  # Logique métier
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Calculs stats, API abstraction
│   │   └── middlewares/  # Auth, RBAC, Validation
│   ├── seed.js       # Script de données de test
│   └── server.js     # Entry point
│
└── frontend/         # ⚠️ React + TypeScript + Vite (70% complet)
    ├── src/
    │   ├── components/   # UI Components
    │   ├── pages/        # Pages (Home, Teams, Scrims, etc.)
    │   ├── services/     # API calls (axios)
    │   ├── stores/       # Zustand stores
    │   ├── hooks/        # React Query hooks
    │   └── types/        # TypeScript types
    └── App.tsx       # Routes
```

## 🚀 API Endpoints Principaux

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Utilisateur actuel

### Teams
- `GET /api/teams` - Liste équipes
- `POST /api/teams` - Créer équipe
- `PUT /api/teams/:id` - Modifier (captain)

### Scrims
- `GET /api/scrims` - Liste scrims
- `POST /api/scrims` - Créer scrim (captain)
- `PUT /api/scrims/:id/results` - Soumettre résultats (host)

### Tournaments
- `GET /api/tournaments` - Liste tournois
- `POST /api/tournaments` - Créer (admin)
- `PUT /api/tournaments/:id/register` - Inscription équipe

### Stats
- `GET /api/stats/players/:id` - Stats joueur
- `GET /api/stats/teams/:id` - Stats équipe
- `GET /api/stats/leaderboard` - Classement

## 🔒 Rôles

- **User** : Créer équipe, rejoindre, voir stats
- **Captain** : Gérer équipe, créer scrims, inscrire tournois
- **Admin** : Gérer tournois, annonces, modération

## 📊 Données de Seed

Le script `npm run seed` crée :
- 7 utilisateurs (1 admin + 6 joueurs)
- 3 équipes complètes avec stats BR
- 5 héros/légendes
- 1 tournoi avec 16 équipes
- Scrims et listings LFT/LFP

## 🔮 Prochaines Étapes

### Frontend
- [ ] Compléter composants UI (Cards, Modals, Forms)
- [ ] Installer shadcn/ui
- [ ] Implémenter graphiques Recharts
- [ ] Intégrer Socket.io client

### Future API Supervive
Fichier prêt : `backend/src/services/superviveAPI.js`

## 🐛 Troubleshooting

**npm not found** : Installez Node.js  
**MongoDB error** : Démarrez MongoDB ou vérifiez Atlas URI  
**Port occupé** : Changez PORT dans .env

## 📖 Documentation Complète

Consultez **[GUIDE_COMPLET.md](./GUIDE_COMPLET.md)** pour :
- Installation détaillée
- Configuration complète
- Guide d'utilisation
- Résolution de problèmes
- Structure détaillée du projet

---

**Développé pour la communauté Supervive Battle Royale 🎮**
