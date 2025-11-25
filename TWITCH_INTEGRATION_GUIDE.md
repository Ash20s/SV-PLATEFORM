# Guide d'intégration Twitch

Ce guide explique comment configurer l'intégration Twitch pour afficher les streams live des utilisateurs de la plateforme.

## 🎯 Fonctionnalités

- **Liaison de compte Twitch** : Les utilisateurs peuvent lier leur compte Twitch depuis les paramètres
- **Carrousel de streams live** : Affichage automatique des streams Twitch en direct sur la page d'accueil
- **OAuth 2.0** : Authentification sécurisée via Twitch OAuth
- **Mise à jour automatique** : Les streams sont rafraîchis toutes les minutes

## 📋 Configuration Twitch Developer

### 1. Créer une application Twitch

1. Allez sur [Twitch Developer Console](https://dev.twitch.tv/console)
2. Cliquez sur **"Register Your Application"**
3. Remplissez les informations :
   - **Name** : Supervive Platform (ou le nom de votre choix)
   - **OAuth Redirect URLs** : 
     - `http://localhost:5173/settings?twitch=callback` (développement)
     - `https://votre-domaine.com/settings?twitch=callback` (production)
   - **Category** : Website Integration
4. Cliquez sur **"Create"**
5. Notez le **Client ID**
6. Générez un **Client Secret** (bouton "New Secret")

### 2. Variables d'environnement Backend

Ajoutez ces variables dans votre fichier `.env` du backend :

```env
# Twitch OAuth Configuration
TWITCH_CLIENT_ID=votre_client_id_ici
TWITCH_CLIENT_SECRET=votre_client_secret_ici
TWITCH_REDIRECT_URI=http://localhost:5173/settings?twitch=callback
```

Pour la production, changez `TWITCH_REDIRECT_URI` vers votre domaine de production.

### 3. Pas de configuration Frontend nécessaire

Le frontend utilise automatiquement l'API backend, aucune variable d'environnement supplémentaire n'est nécessaire.

## 🚀 Utilisation

### Pour les utilisateurs

1. **Connecter son compte Twitch** :
   - Aller dans **Settings** (Paramètres)
   - Onglet **Account**
   - Cliquer sur **"Connect Twitch Account"**
   - Autoriser l'application sur Twitch
   - Le compte est maintenant lié !

2. **Apparaître dans le carrousel** :
   - Une fois le compte lié, si l'utilisateur est en live sur Twitch
   - Son stream apparaît automatiquement dans le carrousel de la page d'accueil
   - Le carrousel affiche : thumbnail, titre, nombre de viewers, et lien vers le profil

3. **Déconnecter son compte** :
   - Aller dans **Settings** > **Account**
   - Cliquer sur **"Unlink Twitch Account"**

### Pour les développeurs

#### API Endpoints disponibles

```javascript
// Get Twitch authorization URL
GET /api/twitch/auth-url
Headers: Authorization: Bearer <token>
Response: { authUrl: "https://id.twitch.tv/oauth2/authorize?..." }

// Handle OAuth callback
POST /api/twitch/callback
Headers: Authorization: Bearer <token>
Body: { code: "authorization_code" }
Response: { message: "Twitch account linked successfully", twitchUser: {...} }

// Get live streams
GET /api/twitch/live-streams
Response: { 
  streams: [
    {
      userId: "123456",
      userName: "streamer_login",
      userDisplayName: "Streamer Name",
      title: "Stream title",
      viewerCount: 1234,
      thumbnailUrl: "https://...",
      gameName: "Supervive",
      platformUser: {
        id: "user_id",
        username: "platform_username",
        avatar: "https://..."
      }
    }
  ]
}

// Get my stream status
GET /api/twitch/my-stream
Headers: Authorization: Bearer <token>
Response: { isStreaming: true, stream: {...} }

// Unlink Twitch account
DELETE /api/twitch/unlink
Headers: Authorization: Bearer <token>
Response: { message: "Twitch account unlinked successfully" }
```

#### Modèle User étendu

Le modèle User a été étendu avec les champs suivants :

```javascript
{
  twitchAuth: {
    twitchId: String,              // ID Twitch unique
    twitchUsername: String,        // Nom d'utilisateur Twitch
    twitchDisplayName: String,     // Nom d'affichage Twitch
    accessToken: String,           // Token d'accès OAuth (encrypté)
    refreshToken: String,          // Token de rafraîchissement
    tokenExpiresAt: Date,          // Date d'expiration du token
    isStreaming: Boolean,          // État du stream (mis à jour périodiquement)
    lastStreamCheck: Date          // Dernière vérification du stream
  }
}
```

## 🎨 Composants Frontend

### TwitchStreamsCarousel

Composant React qui affiche les streams live en carrousel :

```tsx
import TwitchStreamsCarousel from '@/components/TwitchStreamsCarousel';

// Utilisation dans une page
<TwitchStreamsCarousel />
```

**Fonctionnalités** :
- Affiche 3 streams à la fois
- Navigation par flèches
- Rafraîchissement automatique toutes les 60 secondes
- Responsive (1 colonne sur mobile, 3 sur desktop)
- Liens directs vers Twitch

### Service Twitch

Service TypeScript pour interagir avec l'API :

```typescript
import { twitchService } from '@/services/twitchService';

// Obtenir l'URL d'autorisation
const authUrl = await twitchService.getAuthUrl();

// Gérer le callback OAuth
await twitchService.handleCallback(code);

// Obtenir les streams live
const streams = await twitchService.getLiveStreams();

// Délier le compte
await twitchService.unlinkAccount();

// Vérifier si l'utilisateur est en live
const { isStreaming, stream } = await twitchService.getMyStream();
```

## 🔒 Sécurité

- Les tokens OAuth sont stockés côté serveur uniquement
- Les tokens ne sont jamais exposés au frontend
- Utilisation de HTTPS recommandée en production
- Les tokens expirés sont automatiquement rafraîchis

## 🐛 Dépannage

### "Failed to get Twitch access token"

- Vérifiez que `TWITCH_CLIENT_ID` et `TWITCH_CLIENT_SECRET` sont correctement configurés
- Assurez-vous que l'URL de redirection correspond exactement à celle configurée sur Twitch Developer Console

### Les streams n'apparaissent pas

- Vérifiez que l'utilisateur est réellement en live sur Twitch
- Vérifiez que le compte Twitch est bien lié dans les paramètres
- Les streams sont rafraîchis toutes les 60 secondes, attendez un peu

### Erreur lors de la liaison du compte

- Vérifiez que le backend est accessible
- Vérifiez les logs du serveur backend pour plus de détails
- Assurez-vous que l'utilisateur est bien connecté à la plateforme

## 📝 Notes importantes

1. **Limites de l'API Twitch** : 
   - 800 requêtes par minute
   - Le service utilise un token d'application pour vérifier les streams (pas de limite par utilisateur)

2. **Rafraîchissement des tokens** :
   - Les tokens utilisateur expirent après environ 4 heures
   - Le service rafraîchit automatiquement les tokens expirés

3. **Performance** :
   - Le carrousel charge les streams en asynchrone
   - Affiche un skeleton loader pendant le chargement
   - Cache les résultats avec React Query

## 🎉 Déploiement en Production

Avant de déployer en production :

1. ✅ Créez une application Twitch séparée pour la production
2. ✅ Configurez l'URL de redirection vers votre domaine de production
3. ✅ Mettez à jour les variables d'environnement :
   ```env
   TWITCH_CLIENT_ID=production_client_id
   TWITCH_CLIENT_SECRET=production_client_secret
   TWITCH_REDIRECT_URI=https://votre-domaine.com/settings?twitch=callback
   ```
4. ✅ Activez HTTPS sur votre serveur
5. ✅ Testez la liaison et la déconnexion de compte
6. ✅ Vérifiez que les streams apparaissent correctement

## 🤝 Support

Pour toute question ou problème :
- Consultez la [documentation Twitch API](https://dev.twitch.tv/docs/api/)
- Vérifiez les logs du serveur backend
- Ouvrez une issue sur le dépôt Git du projet

