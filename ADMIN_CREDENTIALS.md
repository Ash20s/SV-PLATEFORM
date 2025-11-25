# 🔐 Identifiants Admin

## Compte Administrateur

### Connexion via l'interface web :
- **URL** : http://localhost:5173/login
- **Email** : `admin@supervive.gg`
- **Password** : `admin123`

### Accès Admin :
Une fois connecté, vous aurez accès à :
- 🛠️ **Panel Admin** : http://localhost:5173/admin
- 🎮 **MMR Management** : Gérer les MMR des équipes
- 👥 **Utilisateurs** : Gérer les utilisateurs
- 📊 **Stats globales** : Voir les statistiques du site

---

## Réinitialiser le mot de passe

Si besoin de réinitialiser le mot de passe admin :

```bash
cd backend
node reset-admin-password.js
```

---

## Autres comptes de test

Pour créer d'autres comptes :
- Inscription : http://localhost:5173/login (onglet Register)
- Rôles disponibles : `admin`, `organizer`, `player`, `viewer`

---

**⚠️ IMPORTANT** : 
- Changez le mot de passe en production !
- Ne commitez JAMAIS ce fichier dans le repo public

