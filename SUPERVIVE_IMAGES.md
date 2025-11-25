# 🎨 Images Supervive pour les Événements

## 📸 Sources d'images officielles

### Steam
- **Page officielle** : https://store.steampowered.com/app/2111190/Supervive/
- **Screenshots officiels** à utiliser pour les bannières

### Assets recommandés

#### Pour les Tournois T1 (Compétitif)
```
https://cdn.cloudflare.steamstatic.com/steam/apps/2111190/ss_7c2b0c4d0e02d39ada3cfaf5ef5e8f6c74fa7e70.1920x1080.jpg
```
- Action intense, combat épique
- Parfait pour les tournois majeurs

#### Pour les Tournois T2 / Open
```
https://cdn.cloudflare.steamstatic.com/steam/apps/2111190/ss_c4e0e7a70ff6cbc2d0e19c8b9d12dca8b9f9d41a.1920x1080.jpg
```
- Vue d'ensemble dynamique
- Bon pour les événements communautaires

#### Pour les Scrims
```
https://cdn.cloudflare.steamstatic.com/steam/apps/2111190/ss_3f8e6c8e23d00c5f4d78b2e8d5e1e8c8e8e8e8e8.1920x1080.jpg
```
- Ambiance d'entraînement
- Moins formel

### Header principal (Homepage)
- Utilisez l'artwork principal de Supervive
- Format 16:9 recommandé
- Résolution minimum : 1920x1080

---

## 🛠️ Comment ajouter des images

### Via MongoDB

```javascript
// Mettre à jour un tournoi spécifique
db.tournaments.updateOne(
  { _id: ObjectId("TOURNAMENT_ID") },
  { $set: { 
      bannerImage: "URL_DE_L_IMAGE",
      thumbnail: "URL_THUMBNAIL"
    }
  }
)
```

### Via le script

```bash
cd backend
node add-tournament-images.js
```

### Via l'interface Admin (à venir)
- Panneau admin → Tournaments → Edit → Upload Image

---

## 📐 Spécifications techniques

### Bannières de tournois
- **Format** : 16:9 (idéal)
- **Résolution** : 1920x1080px ou 1280x720px
- **Poids** : < 500KB pour des performances optimales
- **Format de fichier** : JPG, PNG, WebP

### Thumbnails
- **Format** : 16:9 ou 1:1
- **Résolution** : 640x360px ou 400x400px
- **Poids** : < 200KB
- **Format de fichier** : JPG, PNG, WebP

---

## 🎨 Style Guide

### Couleurs dominantes Supervive
- **Primary** : #FF006E (Rose/Magenta)
- **Secondary** : #00FFE5 (Cyan)
- **Background** : #0E0B16 (Noir profond)
- **Cards** : #1A142E (Violet foncé)

### Effets recommandés
- **Overlay gradient** : `from-background via-background/80 to-transparent`
- **Opacity** : 40% par défaut, 50% au hover
- **Blur** : backdrop-blur-sm pour les badges

---

## 📝 TODO

- [ ] Collecter plus de screenshots officiels Supervive
- [ ] Créer des variants pour chaque type d'événement
- [ ] Ajouter upload d'image dans le panel admin
- [ ] Optimiser les images (compression, lazy loading)
- [ ] Ajouter fallback images par défaut

---

## 🔗 Liens utiles

- **Discord Supervive** : Pour demander des assets officiels
- **Press Kit** : Si disponible sur le site officiel
- **Community Content** : Artwork de la communauté (avec permission)

