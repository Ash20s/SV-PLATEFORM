# Guide d'installation des vidéos de background

## Structure des fichiers

1. **Créez le dossier pour les vidéos** :
   ```
   frontend/public/videos/
   ```

2. **Placez vos fichiers .webm dans ce dossier** :
   ```
   frontend/public/videos/bg-gameplay.webm
   frontend/public/videos/bg-cinematic.webm
   etc.
   ```

3. **Optionnel - Créez des miniatures** :
   ```
   frontend/public/images/thumb-gameplay.jpg
   frontend/public/images/thumb-cinematic.jpg
   ```

## Configuration dans Layout.tsx

Pour activer les vidéos de background, modifiez `frontend/src/components/layout/Layout.tsx` :

### Option 1: Vidéo unique fixe
```tsx
import VideoBackground from '../VideoBackground';

// Dans le composant Layout:
<VideoBackground 
  videoUrl="/videos/bg-gameplay.webm"
  fallbackImage="/images/thumb-gameplay.jpg"
  opacity={0.3}        // Opacité de la vidéo (0-1)
  blur={0}            // Flou en pixels
/>
```

### Option 2: Sélecteur de vidéos multiples
```tsx
import DynamicVideoBackground from '../DynamicVideoBackground';

// Dans le composant Layout:
<DynamicVideoBackground 
  opacity={0.3}
  blur={0}
  showSelector={true}  // Affiche le sélecteur en bas à droite
/>
```

Puis modifiez `frontend/src/components/DynamicVideoBackground.tsx` ligne 8-22 :

```tsx
export const BACKGROUND_VIDEOS: BackgroundVideo[] = [
  {
    id: 'gameplay1',
    name: 'Gameplay',
    url: '/videos/bg-gameplay.webm',
    thumbnail: '/images/thumb-gameplay.jpg'
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    url: '/videos/bg-cinematic.webm',
    thumbnail: '/images/thumb-cinematic.jpg'
  },
  // Ajoutez vos autres vidéos ici
];
```

## Activation

Dans `frontend/src/components/layout/Layout.tsx`, changez la ligne 14 :

```tsx
const [useVideoBackground] = useState(true); // true pour vidéos, false pour CSS
```

Et décommentez l'option que vous voulez utiliser (lignes 19-29).

## Optimisation des vidéos .webm

Pour de meilleures performances, optimisez vos vidéos :

### Avec FFmpeg (recommandé):
```bash
# Compression optimale pour le web
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -b:a 128k -c:a libopus output.webm

# Version plus légère (plus compressée)
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 35 -b:v 0 -an output.webm
```

### Recommandations:
- **Résolution** : 1920x1080 max (ou 1280x720 pour mobile)
- **FPS** : 24 ou 30 fps
- **Durée** : 10-30 secondes en boucle
- **Poids** : < 5 MB idéalement
- **Format** : VP9 codec (meilleure compression)

## Paramètres visuels

### Opacité (`opacity`)
- `0.2` - Très subtil, texte très lisible
- `0.3` - Équilibré (recommandé)
- `0.5` - Vidéo bien visible
- `0.8` - Très présent

### Flou (`blur`)
- `0` - Aucun flou (par défaut)
- `2` - Léger flou
- `5` - Flou moyen
- `10` - Très flou (abstrait)

### Overlay (`overlayOpacity`)
- `0.5` - Overlay léger
- `0.7` - Overlay moyen (recommandé)
- `0.9` - Overlay fort (texte très lisible)

## Exemple de configuration finale

```tsx
// Layout.tsx
const [useVideoBackground] = useState(true);

{useVideoBackground ? (
  <VideoBackground 
    videoUrl="/videos/supervise-gameplay.webm"
    fallbackImage="/images/supervise-thumb.jpg"
    opacity={0.25}
    blur={0}
    overlay={true}
    overlayOpacity={0.75}
  />
) : (
  <SimpleAnimatedBackground />
)}
```

## Performance

- Les vidéos .webm VP9 sont très optimisées
- Le navigateur met en cache automatiquement
- L'autoplay est supporté car la vidéo est en `muted`
- Fallback sur image si la vidéo ne charge pas
- Compatible mobile (avec `playsInline`)

## Compatibilité navigateurs

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (macOS 14.1+, iOS 14.5+)
- ⚠️ Anciens navigateurs : fallback sur l'image

## Résolution de problèmes

### La vidéo ne joue pas
- Vérifiez que le fichier est bien dans `public/videos/`
- Assurez-vous que `autoPlay` et `muted` sont définis
- Vérifiez la console du navigateur pour les erreurs

### Performance lente
- Réduisez la résolution de la vidéo
- Augmentez la compression (CRF plus élevé)
- Réduisez l'opacité pour moins de pixels à afficher

### Vidéo trop visible / texte illisible
- Augmentez `overlayOpacity` (0.8-0.9)
- Réduisez `opacity` de la vidéo (0.2-0.3)
- Ajoutez du flou (`blur: 2-5`)
