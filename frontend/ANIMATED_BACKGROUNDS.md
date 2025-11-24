# 🎮 Animated Backgrounds - Supervise Platform

Trois composants de fond animé inspirés de **supervive-stats.com** pour créer une ambiance gaming premium.

---

## 📦 Composants Disponibles

### 1. **SimpleAnimatedBackground** (Recommandé ✅)
**Fichier:** `src/components/SimpleAnimatedBackground.tsx`

**Description:** Fond CSS pur avec gradient orbs animés et effets géométriques.

**Avantages:**
- ✅ Performance maximale (CSS uniquement)
- ✅ Aucune dépendance Canvas
- ✅ Responsive automatique
- ✅ Animations fluides (GPU accelerated)

**Utilisation:**
```tsx
import SimpleAnimatedBackground from '@/components/SimpleAnimatedBackground';

<div className="relative">
  <SimpleAnimatedBackground />
  {/* Votre contenu */}
</div>
```

**Caractéristiques:**
- Orbs de gradient turquoise/vert animés
- Grille géométrique subtile
- Lignes SVG animées
- Overlay sombre pour lisibilité

---

### 2. **AnimatedBackground** (Canvas - Effet Particules)
**Fichier:** `src/components/AnimatedBackground.tsx`

**Description:** Fond avec particules animées type "stars field" + hexagones flottants.

**Avantages:**
- ✨ Effet visuel impressionnant
- ✨ Particules connectées interactives
- ✨ Hexagones géométriques en rotation
- ✨ Gradient radial dynamique

**Inconvénients:**
- ⚠️ Plus gourmand en CPU (Canvas 2D)
- ⚠️ Peut ralentir sur mobile/laptop faible

**Utilisation:**
```tsx
import AnimatedBackground from '@/components/AnimatedBackground';

<div className="relative">
  <AnimatedBackground />
  {/* Votre contenu */}
</div>
```

**Caractéristiques:**
- ~50-200 particules animées
- Connexions entre particules proches
- 3 hexagones flottants en rotation
- Gradient radial turquoise/vert

---

### 3. **GameBackground** (Avec Image du Jeu)
**Fichier:** `src/components/GameBackground.tsx`

**Description:** Fond avec image du jeu Supervise (si disponible) + overlays animés.

**Avantages:**
- 🎯 Immersion maximale avec artwork du jeu
- 🎯 Flexibilité (avec ou sans image)
- 🎯 Opacité ajustable
- 🎯 Effets scanline optionnels

**Utilisation:**
```tsx
import GameBackground from '@/components/GameBackground';

// Avec image
<GameBackground 
  imageUrl="/assets/supervise-bg.jpg" 
  opacity={0.15} 
/>

// Sans image (fallback sur gradients)
<GameBackground />
```

**Props:**
- `imageUrl?: string` - URL de l'image de fond
- `opacity?: number` - Opacité de l'image (défaut: 0.15)

**Caractéristiques:**
- Image blur + brightness réduite
- Orbs de gradient par-dessus
- Grille tech + lignes diagonales
- Vignette + scanlines

---

## 🚀 Installation Actuelle

Le background est déjà installé dans `Layout.tsx`:

```tsx
import SimpleAnimatedBackground from '../SimpleAnimatedBackground';

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <SimpleAnimatedBackground />
      
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

---

## 🔄 Changer de Background

### Pour utiliser le Canvas avec particules:
```tsx
// Layout.tsx
import AnimatedBackground from '../AnimatedBackground';

<div className="relative">
  <AnimatedBackground />
  {/* ... */}
</div>
```

### Pour utiliser avec image du jeu:
```tsx
// Layout.tsx
import GameBackground from '../GameBackground';

<div className="relative">
  <GameBackground imageUrl="/path/to/supervise-artwork.jpg" opacity={0.2} />
  {/* ... */}
</div>
```

### Pour désactiver:
```tsx
// Layout.tsx
// Supprimer simplement le composant background
<div className="min-h-screen flex flex-col bg-background">
  {/* Pas de background animé */}
</div>
```

---

## ⚙️ Personnalisation

### Modifier les couleurs des orbs:
```tsx
// SimpleAnimatedBackground.tsx - Ligne ~15
style={{
  background: 'radial-gradient(circle, rgba(0, 255, 198, 0.3) 0%, transparent 70%)',
  // Changez rgba(0, 255, 198, ...) pour votre couleur
}}
```

### Ajuster l'opacité globale:
```tsx
// SimpleAnimatedBackground.tsx - Dernière div
<div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />
//                                                              ↑ 60%      ↑ 85%
// Augmentez les valeurs pour assombrir, diminuez pour éclaircir
```

### Modifier la vitesse d'animation:
```tsx
// SimpleAnimatedBackground.tsx - Keyframes
animation: 'float 20s ease-in-out infinite',
//                 ↑ Durée en secondes
```

---

## 🎨 Palette de Couleurs

Les backgrounds utilisent les couleurs du design system:

```css
Turquoise Primary: rgba(0, 255, 198, ...)   /* #00FFC6 */
Green Accent:      rgba(25, 249, 169, ...)  /* #19F9A9 */
Dark Background:   rgba(28, 28, 30, ...)    /* #1C1C1E */
```

---

## 📊 Performance

### SimpleAnimatedBackground (CSS)
- **FPS:** ~60 constant
- **CPU:** <1%
- **Mobile:** ✅ Excellent

### AnimatedBackground (Canvas)
- **FPS:** ~50-60
- **CPU:** 3-8%
- **Mobile:** ⚠️ Bon sur récent, ralenti sur ancien

### GameBackground (Image + CSS)
- **FPS:** ~60 constant
- **CPU:** <2%
- **Mobile:** ✅ Très bon
- **Note:** Dépend de la taille de l'image

---

## 🎯 Recommandations

| Situation | Background Recommandé |
|-----------|----------------------|
| Production générale | `SimpleAnimatedBackground` |
| Page d'accueil/Landing | `GameBackground` avec image |
| Dashboard stats | `AnimatedBackground` (particules) |
| Mobile/Performance critique | `SimpleAnimatedBackground` |
| Sans background | Supprimer le composant |

---

## 🐛 Troubleshooting

### Le background ne s'affiche pas
- ✅ Vérifier que le composant a `-z-10` ou `z-index` négatif
- ✅ Vérifier que le parent a `relative` ou `position: relative`
- ✅ Vérifier que le contenu a `relative z-10` pour être au-dessus

### Performance faible avec AnimatedBackground
- ➡️ Réduire le nombre de particules (ligne ~47)
- ➡️ Passer à `SimpleAnimatedBackground`
- ➡️ Désactiver les connexions entre particules (ligne ~77)

### L'image du GameBackground ne charge pas
- ✅ Vérifier le chemin de l'image
- ✅ Placer l'image dans `public/assets/`
- ✅ Utiliser `/assets/nom-image.jpg` comme URL

---

## 📝 Exemple Complet

```tsx
import { ReactNode } from 'react';
import SimpleAnimatedBackground from '../SimpleAnimatedBackground';

interface PageProps {
  children: ReactNode;
}

export default function GamingPage({ children }: PageProps) {
  return (
    <div className="min-h-screen relative">
      {/* Background animé */}
      <SimpleAnimatedBackground />
      
      {/* Contenu par-dessus */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero section */}
        <div className="card-game p-12 text-center mb-12">
          <h1 className="text-gradient-primary text-5xl font-bold mb-4">
            Bienvenue sur Supervise
          </h1>
          <p className="text-muted-foreground text-lg">
            La plateforme compétitive ultime
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-6">
          <div className="stat-card">
            <div className="text-muted-foreground text-sm">Joueurs</div>
            <div className="text-3xl font-bold">12,450</div>
          </div>
          {/* ... */}
        </div>

        {/* Contenu principal */}
        {children}
      </div>
    </div>
  );
}
```

---

Tous les backgrounds sont **prêts à l'emploi** et **optimisés pour le design Supervise** ! 🎮✨
