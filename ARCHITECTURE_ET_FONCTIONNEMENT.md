# Architecture et Fonctionnement du Site Supervive Competitive Platform

## 🏗️ Architecture Générale

### Stack Technique

**Backend (Node.js/Express - JavaScript)**
- **Framework**: Express.js
- **Base de données**: MongoDB (Mongoose)
- **Authentification**: JWT (JSON Web Tokens)
- **Sécurité**: Helmet, CORS, Rate Limiting
- **API Externe**: Intégration avec l'API Supervive (via axios)
- **WebSockets**: Socket.io (pour les mises à jour en temps réel)

**Frontend (React/TypeScript)**
- **Framework**: React 18 avec TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Management**: Zustand (pour l'auth), TanStack Query (pour les données)
- **UI**: Tailwind CSS + Lucide React (icônes)
- **Formulaires**: React Hook Form + Zod (validation)
- **Graphiques**: Recharts

---

## 🔄 Flux de Données Principal

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │ ──────> │   Backend    │ ──────> │   MongoDB   │
│ (React/TS)  │ <────── │ (Node/JS)    │ <────── │             │
└─────────────┘         └──────────────┘         └─────────────┘
                              │
                              │
                              ▼
                       ┌──────────────┐
                       │ Supervive API│
                       │  (Externe)   │
                       └──────────────┘
```

---

## 🔐 Système d'Authentification

### Rôles Utilisateurs
1. **Viewer** : Consultation uniquement
2. **Player** : Peut rejoindre des équipes
3. **Captain** : Peut créer/gérer une équipe
4. **Organizer** : Peut créer des tournois/scrims
5. **Admin** : Accès complet

### Processus d'Auth
1. **Inscription/Login** → Backend génère un JWT
2. **Token stocké** dans `localStorage` (frontend)
3. **Chaque requête** inclut le token dans le header `Authorization: Bearer <token>`
4. **Middleware** vérifie le token et attache l'utilisateur à `req.user`
5. **RBAC** (Role-Based Access Control) vérifie les permissions

---

## 📊 Fonctionnalités Principales

### 1. **Gestion des Équipes**
- **Création d'équipe** : Seuls les `captain` peuvent créer
- **Roster** : 3-4 joueurs selon le mode (Trio/Squad)
- **Rôles** : Captain + membres
- **Stats d'équipe** : Calculées automatiquement depuis les matches

### 2. **Tournois**
- **Création** : Par les `organizer` et `admin`
- **Modes de jeu** :
  - **Trio** : 3 joueurs max par équipe, 12 équipes max par lobby
  - **Squad** : 4 joueurs max par équipe, 10 équipes max par lobby
- **Système de qualification** :
  - Multi-lobby avec transfert automatique des non-qualifiés
  - Calcul automatique du nombre de lobbies et qualifiés
  - Bracket dynamique affiché une fois le tournoi verrouillé
- **Statuts** :
  - `registration` : Inscriptions ouvertes
  - `locked` : Inscriptions fermées, prêt à commencer
  - `ongoing` : En cours
  - `completed` : Terminé
- **Inscription** : Seuls les captains peuvent inscrire leur équipe
- **Système de points** : Placement + kills
- **Prize pool** : Distribution automatique selon les standings

### 3. **Scrims**
- **Création** : Par les `organizer` et `admin`
- **Modes** : Trio ou Squad
- **Statuts** : `pending`, `open`, `confirmed`, `completed`, `cancelled`
- **Inscription** : Captains uniquement, vérification de la taille de l'équipe

### 4. **Intégration API Supervive**
- **Service** : `superviveAPI.js` (backend)
- **Polling automatique** : Récupère les nouveaux matches toutes les 5 minutes
- **Normalisation** : Transforme les données Supervive vers notre format
- **Mapping** : 
  - Mapping des joueurs Supervive → nos joueurs (par DisplayName/Tag)
  - Mapping des équipes Supervive → nos équipes (par roster)
- **Synchronisation** : `matchSyncService.js` synchronise les matches dans notre DB
- **Scoring automatique** : Calcul des points pour les tournois/scrims
- **Stats** : Mise à jour automatique des stats joueurs/équipes

### 5. **Stats et Profils**
- **Stats joueurs** : KDA, wins, avg placement, etc.
- **Stats équipes** : Winrate, ELO, etc.
- **Périodes** : daily, weekly, monthly, season, alltime
- **Graphiques** : Visualisation avec Recharts

### 6. **Mercato (Transfert de Joueurs)**
- **Listings** : Joueurs disponibles pour transfert
- **Offres** : Système d'offres entre équipes

### 7. **Social/Community**
- **Posts** : Publications par utilisateurs/équipes
- **Likes/Comments** : Interactions sociales
- **Feed** : Fil d'actualité

### 8. **Annonces**
- **Création** : Par `captain` et `admin`
- **Affichage** : Sur la page d'accueil

---

## 🔄 Flux de Synchronisation des Matches

```
1. Polling automatique (toutes les 5 min)
   ↓
2. Récupération des nouveaux matches depuis Supervive API
   ↓
3. Normalisation des données (format Supervive → format interne)
   ↓
4. Mapping des joueurs (par DisplayName/Tag)
   ↓
5. Mapping des équipes (par roster de joueurs)
   ↓
6. Création/mise à jour du match dans MongoDB
   ↓
7. Calcul du scoring (si match lié à un tournoi/scrim)
   ↓
8. Mise à jour des stats joueurs/équipes
   ↓
9. Génération de posters (optionnel, pour Twitch)
```

---

## 📁 Structure des Routes API

### Backend (`/api/...`)
- `/auth` : Authentification (register, login, me)
- `/teams` : Gestion des équipes
- `/tournaments` : Tournois (CRUD, inscription, lock/unlock)
- `/scrims` : Scrims (CRUD, inscription)
- `/matches` : Matches Supervive (sync, polling)
- `/stats` : Statistiques
- `/announcements` : Annonces
- `/listings` : Mercato
- `/profile` : Profils utilisateurs
- `/posts` : Posts sociaux
- `/admin` : Administration

### Frontend Routes
- `/` : Page d'accueil (dashboard)
- `/teams` : Liste des équipes
- `/teams/:id` : Détails d'une équipe
- `/my-team` : Gestion de mon équipe
- `/tournaments` : Liste des tournois
- `/tournaments/:id` : Détails d'un tournoi (avec bracket)
- `/tournaments/:id/groups` : Groupes de qualification
- `/scrims` : Liste des scrims
- `/stats` : Statistiques
- `/mercato` : Mercato
- `/profile` : Mon profil
- `/community` : Feed social
- `/organizer` : Dashboard organisateur
- `/admin` : Dashboard admin

---

## 🗄️ Modèles de Données Principaux

### User
- Informations de compte (username, email, password)
- Rôle (viewer, player, captain, organizer, admin)
- Profil (avatar, bio, socials)
- Référence à l'équipe (`teamId`)

### Team
- Nom, tag, logo
- Captain et roster (joueurs)
- Stats d'équipe
- Région

### Tournament
- Informations (nom, description, dates)
- Format (points-based, single-elimination, etc.)
- Système de points (placement + kills)
- Modes de jeu (Trio/Squad)
- Système de qualification (multi-lobby)
- Équipes inscrites
- Standings
- Games (résultats)

### Scrim
- Similaire au tournoi mais plus simple
- Pas de système de qualification
- Statuts plus simples

### Match
- Données du match Supervive
- Résultats normalisés
- Liens vers tournoi/scrim (optionnel)
- Stats des joueurs

### PlayerStats / TeamStats
- Statistiques agrégées
- Par période (daily, weekly, monthly, etc.)

---

## 🔒 Sécurité

1. **JWT** : Tokens signés avec expiration
2. **Bcrypt** : Hash des mots de passe
3. **Helmet** : Headers de sécurité HTTP
4. **CORS** : Configuration stricte
5. **Rate Limiting** : Protection contre les abus
6. **RBAC** : Contrôle d'accès basé sur les rôles
7. **Validation** : Zod pour valider les entrées

---

## 🎨 Frontend - Gestion d'État

### Zustand (Auth Store)
- État d'authentification global
- User actuel
- Token
- Méthodes : `setAuth`, `clearAuth`

### TanStack Query
- Cache des données API
- Synchronisation automatique
- Gestion du loading/error
- Invalidation des queries

---

## 🌐 Internationalisation (i18n)

- Support multi-langues (FR, EN, ES, DE, IT, PT, RU, CN, JP, KR)
- Fichier de traductions : `frontend/src/i18n/translations.ts`
- Hook `useI18n()` pour utiliser les traductions

---

## 🚀 Démarrage

### Backend
```bash
cd backend
npm install
npm run dev  # ou npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Base de données
- MongoDB doit être en cours d'exécution
- Seed initial : `cd backend && node seed.js`

---

## 📝 Points Importants

1. **Backend gère l'API Supervive** : Le frontend ne communique jamais directement avec l'API Supervive
2. **Normalisation** : Toutes les données Supervive sont normalisées avant stockage
3. **Mapping dynamique** : Les équipes/joueurs Supervive sont mappés vers nos équipes/joueurs
4. **Scoring automatique** : Les points sont calculés automatiquement lors de la sync
5. **Bracket dynamique** : Le bracket s'adapte automatiquement au nombre d'équipes inscrites
6. **Mock mode** : L'API peut fonctionner en mode mock pour le développement

---

## 🔮 Fonctionnalités Futures Possibles

- WebSockets pour les mises à jour en temps réel
- Notifications push
- Système de check-in pour les tournois
- Waitlist automatique
- Génération de posters pour Twitch
- Export de données
- API publique pour les stats




