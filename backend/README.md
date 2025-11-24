# Supervive Competitive Platform - Backend

## Description
Backend Node.js/Express pour la plateforme compétitive Supervive (Battle Royale). Gestion des utilisateurs, équipes, scrims, tournois, statistiques, annonces et notifications temps réel.

## Stack
- Node.js 20+
- Express.js
- MongoDB Atlas + Mongoose
- JWT + bcrypt
- Socket.io (real-time)
- Cloudinary (uploads)
- Zod (validation)

## Installation
```bash
cd backend
npm install
```

## Configuration
Créez un fichier `.env` à la racine du backend :
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/supervive
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

## Database Seeding
```bash
npm run seed
```

## Development
```bash
npm run dev
```

## Battle Royale Scoring
- **Placement Points**: 1st=12, 2nd=9, 3rd=7, 4th=5, 5th-6th=4, 7th-8th=3, 9th-12th=2, 13th-16th=1
- **Kill Points**: 1pt per kill
- **ELO**: Calculated from placement + kills

## API Endpoints
Voir le fichier complet pour la liste complète des endpoints.
- Zod
- Socket.io
- Cloudinary
- Helmet, CORS, Morgan, Rate Limiter
- TypeScript ready

## Installation
```bash
npm install
```

## Démarrage
```bash
npm run dev
```

## Variables d'environnement
Voir `.env.example` pour la configuration.

## Scripts
- `npm run dev` : Démarrage en mode développement
- `npm start` : Démarrage en production
- `npm test` : Lancer les tests Jest

## Structure
Voir le dossier `src/` pour l'architecture complète.

## Tests
Les tests unitaires et d'intégration sont dans le dossier `tests/`.

## API Documentation
Swagger à venir.

## Auteur
Supervive Dev Team
