# 🚀 Quick Start - Intégration Twitch

## Configuration rapide en 5 minutes

### 1. Créer l'application Twitch

1. Allez sur https://dev.twitch.tv/console
2. Cliquez sur "Register Your Application"
3. Remplissez :
   - **Name**: Supervive Platform
   - **OAuth Redirect URLs**: `http://localhost:5173/settings?twitch=callback`
   - **Category**: Website Integration
4. Créez et notez le **Client ID** et générez un **Client Secret**

### 2. Configurer le Backend

Ajoutez ces lignes dans votre fichier `backend/.env` :

```env
TWITCH_CLIENT_ID=votre_client_id
TWITCH_CLIENT_SECRET=votre_client_secret
TWITCH_REDIRECT_URI=http://localhost:5173/settings?twitch=callback
```

### 3. Redémarrer le Backend

```bash
cd backend
npm run dev
```

### 4. C'est tout ! 🎉

- Les utilisateurs peuvent maintenant lier leur compte Twitch dans **Settings > Account**
- Les streams live s'affichent automatiquement sur la page d'accueil
- Le carrousel se met à jour toutes les 60 secondes

## Test rapide

1. Connectez-vous sur la plateforme
2. Allez dans **Settings** > **Account**
3. Cliquez sur **"Connect Twitch Account"**
4. Autorisez l'application
5. Si vous êtes en live sur Twitch, votre stream apparaîtra sur la page d'accueil !

---

Pour plus de détails, consultez [TWITCH_INTEGRATION_GUIDE.md](./TWITCH_INTEGRATION_GUIDE.md)

