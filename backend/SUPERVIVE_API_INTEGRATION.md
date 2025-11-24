# Intégration API Supervive - Documentation

## 📋 Résumé des échanges avec Zendrex (Dev Supervive)

### Points clés de la conversation

#### 1. **Format des données disponibles**
- ✅ Pas de concept de "team tag" dans l'API Supervive
- ✅ Pas d'endpoint de profil (KDA, etc. doivent être calculés localement)
- ✅ Les matches sont **uniquement disponibles après completion** (pas de matches en cours)
- ✅ `team_id` change entre chaque match → **Besoin d'une DB propre pour tracker les équipes**

#### 2. **Différences importantes**
- `player_team_id` = `player{}.teamId` (ID de l'équipe du joueur dans ce match spécifique)
- `team_id` = ID de l'équipe dans le match
- **Les deux changent entre matches** → Nécessité d'un système de mapping

#### 3. **Rate Limiting**
- Pas de rate limit strict actuellement
- Zendrex peut configurer un cache layer pour notre clé API
- Rate limit sera implémenté car l'API est gratuite/sur demande spéciale

#### 4. **Système de polling requis**
- Pas de webhooks ou matches en cours
- **Besoin de polling régulier** pour détecter les nouveaux matches
- Timer/polling automatique nécessaire

---

## 📊 Schéma de données fourni par Zendrex

```json
{
  "MatchID": "string",
  "MatchDetails": {
    "MatchStart": "2025-11-12T09:14:06.849Z",
    "MatchEnd": "2025-11-12T09:14:06.849Z",
    "NumParticipants": 1,
    "NumTeams": 1,
    "MaxTeamSize": 1,
    "ConnectionDetails": {
      "Region": "us-east-2"
    },
    "Participants": [
      {
        "HeroAssetID": "string",
        "TeamID": "string",
        "ID": "string",
        "DisplayName": "string",
        "Tag": "string",
        "Region": "string",
        "IsRanked": true,
        "Rank": "Unranked",
        "RankRating": 1
      }
    ]
  },
  "TeamMatchDetails": [
    {
      "TeamID": "string",
      "Placement": 1
    }
  ],
  "PlayerMatchDetails": {
    "player_user_id": {
      "PlayerID": "string",
      "DisplayName": "string",
      "Tag": "string",
      "HeroAssetID": "string",
      "TeamID": "string",
      "Placement": 1,
      "SurvivalDuration": 1,
      "CharacterLevel": 1,
      "PlayerMatchStats": {
        "ArmorMitigatedDamage": 1,
        "Assists": 1,
        "CreepKills": 1,
        "DamageDone": 1,
        "DamageTaken": 1,
        "Deaths": 1,
        "EffectiveDamageDone": 1,
        "EffectiveDamageTaken": 1,
        "GoldFromEnemies": 1,
        "GoldFromMonsters": 1,
        "GoldFromTreasure": 1,
        "HealingGiven": 1,
        "HealingGivenSelf": 1,
        "HealingReceived": 1,
        "HeroDamageDone": 1,
        "HeroDamageTaken": 1,
        "HeroEffectiveDamageDone": 1,
        "HeroEffectiveDamageTaken": 1,
        "Kills": 1,
        "Knocked": 1,
        "Knocks": 1,
        "MaxKillStreak": 1,
        "MaxKnockStreak": 1,
        "Resurrected": 1,
        "Resurrects": 1,
        "Revived": 1,
        "Revives": 1,
        "ShieldMitigatedDamage": 1
      }
    }
  }
}
```

---

## 🎯 Besoins d'Ash

### Champs minimum requis

1. **Matches**
   - `match_id`
   - `match_date`
   - `team_size`
   - `total_teams`
   - `winner_team_tag` (à mapper depuis notre DB)

2. **Teams** (dans un match)
   - `team_tag` (depuis notre DB)
   - `match_id`
   - `placement`
   - `kills`
   - `total_points`

3. **Players** (dans un match)
   - `player_id`
   - `player_name`
   - `team_tag` (depuis notre DB)
   - `match_id`
   - `kills`
   - `assists`
   - `deaths`
   - `placement`

4. **Profiles** (agrégation)
   - `player_id`
   - `player_name`
   - `team_tag`
   - `total_matches`
   - `total_wins`
   - `average_placement`
   - `average_kills`
   - `total_points`
   - `kda_ratio`

### Fonctionnalités demandées

1. ✅ **Scoring automatique après chaque game**
2. ✅ **Statistiques sur joueurs et profils**
3. ✅ **Génération de posters pour les gagnants** (Twitch Live)
   - Exemple: "The Ghost played a great game with 70,000 damage dealt"

---

## 🏗️ Architecture de la solution

### 1. **Système de mapping Teams**
- Table `TeamMappings` pour lier `SuperviveTeamID` (changeant) → `OurTeamID` (stable)
- Basé sur les joueurs dans l'équipe
- Mise à jour automatique lors de chaque match

### 2. **Système de polling**
- Service qui interroge l'API toutes les X minutes
- Détecte les nouveaux matches
- Traite uniquement les matches non synchronisés

### 3. **Système de scoring**
- Calcul automatique des points selon le système du tournoi
- Mise à jour des standings
- Notification des changements

### 4. **Système de statistiques**
- Agrégation des données de matches
- Calcul des profils joueurs
- Calcul des stats d'équipes

### 5. **Génération de posters**
- Endpoint pour générer des images de stats
- Format pour Twitch OBS
- Templates personnalisables

---

## 🔧 Configuration requise

### Variables d'environnement

```env
SUPERVIVE_API_URL=https://api.supervive.com/v1
SUPERVIVE_API_KEY=your_api_key_here
SUPERVIVE_POLL_INTERVAL=300000  # 5 minutes en millisecondes
SUPERVIVE_ENABLE_AUTO_SYNC=true
```

---

## 📝 Prochaines étapes

1. ✅ Mise à jour du service `superviveAPI.js`
2. ✅ Création du système de polling
3. ✅ Création du mapping Teams
4. ✅ Intégration du scoring automatique
5. ✅ Création du système de génération de posters

