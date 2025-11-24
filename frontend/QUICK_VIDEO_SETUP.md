# 🎬 Guide Rapide - Backgrounds Vidéo .webm

## ⚡ Installation en 3 étapes

### 1️⃣ Placez vos vidéos .webm
Copiez vos fichiers `.webm` dans :
```
frontend/public/videos/
```

Exemple :
- `frontend/public/videos/bg-gameplay.webm`
- `frontend/public/videos/bg-cinematic.webm`

### 2️⃣ Activez les vidéos
Ouvrez `frontend/src/components/layout/Layout.tsx`

Ligne 18, changez :
```tsx
const [useVideoBackground] = useState(true);  // ← Mettez true
```

### 3️⃣ Configurez votre vidéo
Ligne 32, modifiez :
```tsx
<VideoBackground 
  videoUrl="/videos/bg-gameplay.webm"        // ← Votre fichier
  fallbackImage="/images/thumb-gameplay.jpg" // ← Optionnel
  opacity={0.3}                               // ← Ajustez (0.2-0.5)
  blur={0}                                    // ← Flou si désiré
  overlayOpacity={0.75}                       // ← Lisibilité texte
/>
```

## ✅ C'est tout !

Le background vidéo sera actif sur tout le site.

---

## 🎨 Ajuster les paramètres

### Vidéo trop visible ?
```tsx
opacity={0.2}           // Réduire l'opacité
overlayOpacity={0.85}   // Augmenter l'overlay
```

### Texte difficile à lire ?
```tsx
overlayOpacity={0.9}    // Overlay plus fort
blur={3}                 // Ajouter du flou
```

### Vidéo trop animée/distrayante ?
```tsx
blur={5}                 // Flou moyen
opacity={0.25}          // Opacité faible
```

---

## 🔄 Revenir au background CSS animé

Ligne 18 :
```tsx
const [useVideoBackground] = useState(false);
```

---

## 📁 Structure finale

```
frontend/
├── public/
│   ├── videos/
│   │   ├── bg-gameplay.webm      ← Vos vidéos ici
│   │   └── bg-cinematic.webm
│   └── images/
│       └── thumb-gameplay.jpg     ← Optionnel (fallback)
└── src/
    └── components/
        ├── layout/
        │   └── Layout.tsx         ← Activation ici
        └── VideoBackground.tsx    ← Composant vidéo
```

---

## 🚀 Pour plusieurs vidéos avec sélecteur

Voir le guide complet dans `VIDEO_BACKGROUND_GUIDE.md`
