# 🖼️ Guide d'Ajout d'Images

## 📥 Comment ajouter l'image Supervive

### Méthode 1 : Image locale (Recommandé)

1. **Sauvegardez l'image** que vous avez envoyée
   - Clic droit sur l'image → "Enregistrer l'image sous..."
   - Nommez-la : `supervive-main-banner.jpg`

2. **Placez l'image** dans le dossier :
   ```
   frontend/public/assets/images/banners/supervive-main-banner.jpg
   ```

3. **Mettez à jour le tournoi featured** :
   ```bash
   cd backend
   node update-featured-tournament.js
   ```

---

### Méthode 2 : Hébergement externe (Plus rapide)

1. **Uploadez l'image** sur un service :
   - **Imgur** : https://imgur.com/upload
   - **imgbb** : https://imgbb.com/
   - **Cloudinary** : https://cloudinary.com/

2. **Copiez l'URL** de l'image

3. **Mettez à jour manuellement** :
   ```bash
   cd backend
   node -e "require('dotenv').config(); const mongoose = require('mongoose'); const Tournament = require('./src/models/Tournament'); mongoose.connect(process.env.MONGO_URI).then(async () => { const featured = await Tournament.findOne({ status: 'open' }).sort({ startDate: 1 }); if (featured) { featured.bannerImage = 'URL_DE_VOTRE_IMAGE_ICI'; await featured.save(); console.log('✅ Image mise à jour !'); } process.exit(0); });"
   ```

   Remplacez `URL_DE_VOTRE_IMAGE_ICI` par l'URL copiée.

---

## 🎨 Images recommandées pour chaque type

### Featured Tournament (Principal)
- **Image** : supervive-main-banner.jpg (celle fournie)
- **Style** : Artwork officiel avec logo Supervive
- **Localisation** : `banners/supervive-main-banner.jpg`

### Tournois T1 (Compétitif)
- **Style** : Action, épique, intense
- **Exemples** : Personnages en combat, arènes
- **Localisation** : `tournaments/t1-*.jpg`

### Tournois T2 (Communautaire)
- **Style** : Friendly, coloré, accessible
- **Exemples** : Équipes, collaboration
- **Localisation** : `tournaments/t2-*.jpg`

### Scrims (Entraînement)
- **Style** : Pratique, décontracté
- **Exemples** : Setup gaming, training
- **Localisation** : `scrims/*.jpg`

---

## ⚡ Quick Start

**Option la plus rapide** :

1. Faites clic droit sur l'image → Copier l'image
2. Allez sur https://imgbb.com/
3. Collez l'image (Ctrl+V)
4. Cliquez sur "Upload"
5. Copiez le lien "Direct Link"
6. Exécutez :

```bash
cd backend
node set-featured-image.js COLLEZ_LE_LIEN_ICI
```

---

## 📝 Formats supportés

- ✅ JPG / JPEG
- ✅ PNG
- ✅ WebP
- ✅ GIF

**Taille recommandée** : 1920x1080px (16:9)
**Poids max** : 2MB pour performances optimales

