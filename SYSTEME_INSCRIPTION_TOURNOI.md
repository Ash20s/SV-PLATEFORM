# 🎮 Système d'Inscription aux Tournois avec Sélection de Joueurs et Guest Players

## 📋 Vue d'ensemble

Le système permet aux équipes de s'inscrire aux tournois avec deux modes :
- **Squad** : 4 joueurs requis
- **Trio** : 3 joueurs requis

Il gère automatiquement la sélection des joueurs selon la taille de l'équipe et permet d'inviter des **guest players** (subs) qui ne font pas partie de l'équipe.

---

## 🔄 Flux d'inscription

### Cas 1 : Inscription instantanée (Auto)

**Quand ça se passe :**
- L'équipe a exactement le bon nombre de joueurs pour le format du tournoi
- Exemple : Équipe de 4 joueurs pour un tournoi Squad (4 requis)

**Comment ça marche :**
1. Le capitaine clique sur "S'inscrire" au tournoi
2. Le backend détecte automatiquement que l'équipe a exactement 4 joueurs
3. **Inscription automatique** → Tous les joueurs sont sélectionnés automatiquement
4. L'équipe est inscrite instantanément ✅

```javascript
// Backend détecte : allTeamPlayers.length === requiredSize
// → Auto-sélection de tous les joueurs
participatingPlayers = allTeamPlayers.map(...)
```

---

### Cas 2 : Sélection manuelle requise

**Quand ça se passe :**
- L'équipe a PLUS de joueurs que le format requis
- Exemple : Équipe de 6 joueurs pour un tournoi Squad (4 requis)

**Comment ça marche :**
1. Le capitaine clique sur "S'inscrire"
2. Le backend détecte que l'équipe a plus de joueurs que nécessaire
3. **Retourne une erreur** avec `requiresSelection: true`
4. Le frontend affiche une interface de sélection
5. Le capitaine sélectionne **exactement** 4 joueurs parmi les 6
6. Validation → Inscription avec les 4 joueurs sélectionnés ✅

```javascript
// Backend retourne :
{
  message: "Your team has 6 player(s). Please select exactly 4 players...",
  requiresSelection: true,
  availablePlayers: [...],
  requiredSize: 4
}
```

---

### Cas 3 : Équipe trop petite

**Quand ça se passe :**
- L'équipe a MOINS de joueurs que le format requis
- Exemple : Équipe de 2 joueurs pour un tournoi Squad (4 requis)

**Comment ça marche :**
1. Le capitaine clique sur "S'inscrire"
2. Le backend détecte que l'équipe manque de joueurs
3. **Option 1** : Inviter des guest players pour compléter
4. **Option 2** : Message d'erreur indiquant qu'il faut plus de joueurs

---

## 👥 Système de Guest Players (Subs)

### Qu'est-ce qu'un Guest Player ?

Un **guest player** (sub) est un joueur qui :
- ❌ **N'est PAS** membre officiel de l'équipe
- ✅ **Peut jouer** temporairement pour l'équipe dans un tournoi spécifique
- ✅ **Remplace** un membre de l'équipe (optionnel)
- ✅ **Valable uniquement** pour ce tournoi

### Comment inviter un Guest Player ?

#### 1. Pendant l'inscription
```javascript
// Le capitaine envoie lors de l'inscription :
{
  selectedPlayers: [player1, player2, player3], // 3 joueurs de l'équipe
  guestPlayers: [
    {
      playerId: "guest123",
      role: "DPS",
      replacingPlayer: "player4", // Optionnel
      message: "Tu peux remplacer Player4 ?"
    }
  ]
}
```

#### 2. Après l'inscription
- Le capitaine peut inviter un guest player via `/api/tournaments/:id/invite-guest`
- L'invitation est créée dans la base de données
- Un email/notification est envoyé au guest player (à implémenter)

### Flux d'invitation Guest Player

```
1. Capitaine invite un joueur externe
   ↓
2. Invitation créée (status: 'pending')
   ↓
3. Guest player reçoit l'invitation
   ↓
4. Guest player accepte/rejette
   ↓
5a. Si accepté → Ajouté aux participatingPlayers
5b. Si rejeté → Invitation annulée
```

### Exemple concret

**Situation :**
- Équipe A a 4 joueurs réguliers
- Un joueur (Player4) ne peut pas jouer le jour J
- Équipe A veut inviter "SuperSub" qui n'est pas dans l'équipe

**Processus :**
1. Capitaine s'inscrit avec 3 joueurs réguliers + invite "SuperSub"
2. Invitation envoyée à "SuperSub" (status: pending)
3. "SuperSub" accepte l'invitation
4. "SuperSub" est automatiquement ajouté aux `participatingPlayers`
5. Équipe A a maintenant 3 réguliers + 1 guest = 4 joueurs ✅

---

## 📊 Structure des données

### Inscription d'une équipe (`registeredTeams`)

```javascript
{
  team: ObjectId("team123"),
  registeredAt: Date,
  checkedIn: false,
  
  // Joueurs sélectionnés pour jouer
  participatingPlayers: [
    {
      player: ObjectId("player1"),
      isGuest: false,        // Membre régulier
      isMainRoster: true,
      role: "DPS"
    },
    {
      player: ObjectId("player2"),
      isGuest: false,
      isMainRoster: true,
      role: "Tank"
    },
    {
      player: ObjectId("guest123"),
      isGuest: true,         // Guest player !
      isMainRoster: false,
      role: "Support",
      guestInviteId: ObjectId("invite456")
    }
  ],
  
  // Invitations de guest players en cours
  guestPlayers: [
    {
      player: ObjectId("guest123"),
      inviteStatus: "accepted", // pending | accepted | rejected
      invitedAt: Date,
      acceptedAt: Date,
      invitedBy: ObjectId("captain"),
      role: "Support",
      replacingPlayer: ObjectId("player4") // Optionnel
    }
  ]
}
```

### Invitation Guest Player (`GuestInvite`)

```javascript
{
  tournament: ObjectId("tournament123"),
  team: ObjectId("team123"),
  guestPlayer: ObjectId("guest123"),
  invitedBy: ObjectId("captain"),
  status: "pending", // pending | accepted | rejected | expired
  role: "DPS",
  replacingPlayer: ObjectId("player4"), // Optionnel
  message: "Tu peux jouer ce tournoi ?",
  expiresAt: Date, // 7 jours après invitation
  invitedAt: Date
}
```

---

## 🔌 Endpoints API

### Inscription
```http
POST /api/tournaments/:id/register
Body: {
  selectedPlayers?: [userId1, userId2, ...],  // Optionnel si auto
  guestPlayers?: [{ playerId, role, replacingPlayer?, message? }]
}
```

### Inviter un Guest Player
```http
POST /api/tournaments/:id/invite-guest
Body: {
  playerId: string,
  role: string,
  replacingPlayer?: string,
  message?: string
}
```

### Voir ses invitations
```http
GET /api/guest-invites/pending
```

### Accepter/Rejeter une invitation
```http
POST /api/guest-invites/:id/accept
POST /api/guest-invites/:id/reject
```

### Annuler une invitation (Capitaine)
```http
DELETE /api/guest-invites/:id
```

---

## 🎯 Scénarios d'utilisation

### Scénario 1 : Équipe parfaite
```
Équipe de 4 joueurs → Tournoi Squad (4 requis)
→ Inscription instantanée ✅
```

### Scénario 2 : Équipe avec benchs
```
Équipe de 6 joueurs → Tournoi Squad (4 requis)
→ Sélection de 4 joueurs parmi 6
→ Inscription avec sélection ✅
```

### Scénario 3 : Remplacement temporaire
```
Équipe de 4 joueurs → 1 joueur indisponible
→ Invite un guest player
→ Guest accepte → Équipe complète ✅
```

### Scénario 4 : Équipe incomplète
```
Équipe de 2 joueurs → Tournoi Squad (4 requis)
→ Invite 2 guest players
→ Guests acceptent → Équipe complète ✅
```

---

## 🚀 Avantages du système

✅ **Flexibilité** : Gère les équipes de différentes tailles  
✅ **Automatisation** : Inscription instantanée si l'équipe est complète  
✅ **Guest Players** : Pas besoin de créer une nouvelle équipe pour remplacer un joueur  
✅ **Temporaire** : Les guest players sont valables uniquement pour le tournoi  
✅ **Traçabilité** : Historique complet des invitations et remplacements  

---

## 📝 Prochaines étapes (Frontend)

1. **Interface de sélection de joueurs** : Checkboxes pour choisir les joueurs
2. **Interface d'invitation** : Recherche de joueurs + formulaire d'invitation
3. **Notifications** : Affichage des invitations en attente
4. **Validation visuelle** : Afficher les joueurs sélectionnés et les guests

---

## 🔧 Configuration

Le système détecte automatiquement le format du tournoi :
- **Squad** = 4 joueurs requis
- **Trio** = 3 joueurs requis

Ces valeurs sont définies dans le modèle `Tournament` avec `gameMode`.

