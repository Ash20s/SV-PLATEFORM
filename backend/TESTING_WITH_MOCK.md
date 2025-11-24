# 🧪 Guide de test avec le système Mock

## 📋 Vue d'ensemble

Le système mock permet de tester toutes les fonctionnalités de l'intégration API Supervive **sans avoir accès à la vraie API**. C'est parfait pour le développement et les tests.

## 🔧 Activation du mode Mock

Le mode mock s'active automatiquement si :
- La variable `SUPERVIVE_API_KEY` n'est pas définie dans `.env`
- OU si `SUPERVIVE_USE_MOCK=true` est défini

```env
# Pour forcer le mode mock
SUPERVIVE_USE_MOCK=true

# Ou simplement ne pas définir SUPERVIVE_API_KEY
# SUPERVIVE_API_KEY=
```

## 🎮 Données de test générées

Le mock génère automatiquement :
- **5 matches de test** au démarrage
- **8 joueurs** avec noms et tags réalistes
- **12 équipes** par match (3 joueurs par équipe)
- **Stats réalistes** basées sur le placement
- **Données conformes** au schéma de Zendrex

### Joueurs de test
- TheGhost (GHOST)
- ShadowHunter (SHADOW)
- FrostBite (FROST)
- FireStorm (FIRE)
- ThunderBolt (THUNDER)
- IceQueen (ICE)
- DarkKnight (DARK)
- LightBringer (LIGHT)

## 🚀 Utilisation

### 1. Vérifier le mode et les stats

```bash
GET /api/mock/stats
```

Réponse :
```json
{
  "message": "Mock API Statistics",
  "stats": {
    "totalMatches": 5,
    "totalPlayers": 8,
    "latestMatch": "match_1234567890_1",
    "oldestMatch": "match_1234567890_5"
  },
  "mode": "MOCK"
}
```

### 2. Lister les matches mock disponibles

```bash
GET /api/mock/matches?limit=10
```

Réponse :
```json
{
  "matches": [
    {
      "matchId": "match_1234567890_1",
      "matchStart": "2025-11-12T10:00:00.000Z",
      "matchEnd": "2025-11-12T10:25:00.000Z",
      "numTeams": 12,
      "numParticipants": 36,
      "region": "us-east-2",
      "winner": "team_match_1234567890_1_0"
    }
  ],
  "total": 5
}
```

### 3. Ajouter un nouveau match de test

```bash
POST /api/mock/match
Headers: Authorization: Bearer <admin_token>
```

Créera un nouveau match avec des données aléatoires mais réalistes.

### 4. Synchroniser un match mock spécifique

```bash
POST /api/mock/sync/:matchId
Headers: Authorization: Bearer <organizer_token>
Body: {
  "matchType": "tournament",  // Optionnel
  "tournament": "tournament_id"  // Optionnel
}
```

Synchronise le match dans votre base de données et :
- Mappe les joueurs
- Mappe les équipes
- Calcule les stats
- Met à jour les standings (si tournoi/scrim)

### 5. Synchroniser tous les matches mock

```bash
POST /api/mock/sync-all
Headers: Authorization: Bearer <organizer_token>
Body: {
  "matchType": "casual"  // Optionnel
}
```

Synchronise tous les matches mock disponibles d'un coup.

### 6. Réinitialiser le mock

```bash
POST /api/mock/reset
Headers: Authorization: Bearer <admin_token>
```

Réinitialise toutes les données mock (supprime les matches générés et en recrée 5).

## 📊 Exemple de workflow de test

### Test complet du système

1. **Vérifier le mode mock**
   ```bash
   GET /api/mock/stats
   ```

2. **Lister les matches disponibles**
   ```bash
   GET /api/mock/matches
   ```

3. **Synchroniser tous les matches**
   ```bash
   POST /api/mock/sync-all
   ```

4. **Vérifier les matches synchronisés**
   ```bash
   GET /api/matches
   ```

5. **Générer un poster pour un joueur**
   ```bash
   POST /api/matches/:matchId/poster/player/:playerId
   ```

6. **Générer un poster pour l'équipe gagnante**
   ```bash
   POST /api/matches/:matchId/poster/winner
   ```

### Test du scoring automatique

1. **Créer un tournoi** (via l'API normale)
2. **Ajouter des matches mock**
   ```bash
   POST /api/mock/match
   ```
3. **Synchroniser avec le tournoi**
   ```bash
   POST /api/mock/sync/:matchId
   Body: { "tournament": "tournament_id" }
   ```
4. **Vérifier les standings du tournoi**
   ```bash
   GET /api/tournaments/:id
   ```

## 🎯 Ce qui est testable avec le mock

✅ **Tout ce qui est testable sans la vraie API :**

- [x] Récupération des matches
- [x] Normalisation des données
- [x] Mapping des joueurs (par ID ou Tag)
- [x] Mapping des équipes (basé sur les joueurs)
- [x] Synchronisation dans la DB
- [x] Calcul des stats joueurs
- [x] Calcul du scoring (tournois/scrims)
- [x] Génération de posters
- [x] Système de polling (simulé)
- [x] Mise à jour des standings

❌ **Ce qui nécessite la vraie API :**

- [ ] Données réelles des joueurs
- [ ] Vraies équipes compétitives
- [ ] Vrais résultats de matches
- [ ] Rate limiting réel
- [ ] Cache layer de Zendrex

## 🔍 Inspection des données mock

### Voir les détails d'un match

```bash
GET /api/matches/:id
```

Vous verrez toutes les données normalisées :
- Stats de tous les joueurs
- Placements des équipes
- Données brutes de l'API (dans `rawData`)

### Voir les stats calculées

```bash
GET /api/stats/player/:playerId
```

Les stats sont automatiquement calculées et mises à jour après chaque synchronisation.

## 🐛 Debugging

### Logs du mock

Le mock affiche des logs dans la console :
- `🔧 Using MOCK Supervive API` au démarrage
- Messages lors de la création de matches
- Erreurs si présentes

### Vérifier les mappings

Après synchronisation, vous pouvez vérifier :
- Les mappings d'équipes dans la collection `teammappings`
- Les matches dans la collection `matches`
- Les stats dans la collection `playerstats`

## 💡 Conseils

1. **Utilisez le mock pour le développement** : Plus rapide, pas de rate limiting
2. **Testez le scoring** : Créez des tournois et synchronisez des matches mock
3. **Générez des posters** : Testez différents joueurs et équipes
4. **Testez le polling** : Le mock simule aussi le polling automatique

## 🔄 Passage au mode réel

Quand vous êtes prêt à utiliser la vraie API :

1. Obtenez votre clé API de Zendrex
2. Configurez dans `.env` :
   ```env
   SUPERVIVE_API_KEY=your_real_api_key
   SUPERVIVE_USE_MOCK=false
   ```
3. Le système basculera automatiquement sur la vraie API

---

**Le mock est identique à la vraie API en termes de format de données**, donc tout ce qui fonctionne avec le mock fonctionnera avec la vraie API ! 🎉

