# 🎨 Supervise Platform - Design System

Design inspiré de **supervive-stats.com** - Style gaming premium professionnel.

---

## 🎯 Palette de Couleurs

### Couleurs Principales
```css
--background: #1C1C1E        /* Gris anthracite - Fond principal */
--card: #2B2B2E              /* Gris légèrement plus clair - Cards */
--popover: #242426           /* Panneaux contrastés */
```

### Couleurs de Texte
```css
--foreground: #FFFFFF        /* Blanc pur - Texte principal */
--card-foreground: #E0E0E0   /* Gris clair - Texte sur cards */
--muted-foreground: #A0A0A0  /* Gris moyen - Texte secondaire */
```

### Couleurs d'Accent
```css
--primary: #00FFC6           /* Turquoise vif - Boutons principaux */
--accent: #19F9A9            /* Vert menthe lumineux - Highlights */
--destructive: Rouge vif     /* Erreurs et alertes */
```

### Bordures
```css
--border: #333               /* Bordures fines discrètes */
```

---

## 📝 Typographie

### Police
- **Famille**: `Inter` (sans-serif géométrique moderne)
- **Poids**: Light (300), Regular (400), Medium (500), Semibold (600), Bold (700)
- **Tracking**: Légèrement espacé (0.02em)

### Hiérarchie
```tsx
<h1> // text-4xl lg:text-5xl - Titres principaux
<h2> // text-3xl lg:text-4xl - Sous-titres
<h3> // text-2xl lg:text-3xl - Sections
<h4> // text-xl lg:text-2xl
<h5> // text-lg lg:text-xl
<h6> // text-base lg:text-lg
<p>  // leading-relaxed (1.7) - Corps de texte
```

---

## 🧱 Composants Réutilisables

### 1. Cards Gaming
```tsx
// Card basique avec ombre
<div className="card-game p-6">
  <h3>Contenu</h3>
</div>

// Stat card avec hover glow
<div className="stat-card">
  <div className="text-muted-foreground text-sm">Label</div>
  <div className="text-3xl font-bold">1,234</div>
</div>
```

### 2. Boutons

```tsx
// Bouton principal avec glow turquoise
<button className="btn-primary">
  Action Principale
</button>

// Bouton secondaire
<button className="btn-secondary">
  Action Secondaire
</button>

// Custom avec classes
<button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md 
                   hover:shadow-glow-md hover:scale-105 transition-all duration-300">
  Bouton Custom
</button>
```

### 3. Inputs

```tsx
<input 
  type="text"
  className="input-game"
  placeholder="Votre texte..."
/>

<select className="input-game">
  <option>Option 1</option>
</select>
```

### 4. Badges

```tsx
// Badge avec glow accent
<span className="badge-accent">
  NEW
</span>

// Badge custom
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
               bg-primary/20 text-primary border border-primary/30 shadow-glow-sm">
  Online
</span>
```

### 5. Tables Gaming

```tsx
<table className="table-game">
  <thead>
    <tr>
      <th>Rang</th>
      <th>Équipe</th>
      <th>Points</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Team Alpha</td>
      <td>1,250</td>
    </tr>
  </tbody>
</table>
```

---

## ✨ Effets Visuels

### Shadows
```tsx
shadow-card       // 0 4px 20px rgba(0, 0, 0, 0.3)
shadow-glow-sm    // 0 0 10px rgba(0, 255, 198, 0.2)
shadow-glow-md    // 0 0 20px rgba(0, 255, 198, 0.3)
shadow-glow-lg    // 0 0 30px rgba(0, 255, 198, 0.4)
shadow-glow-accent // 0 0 20px rgba(25, 249, 169, 0.3)
```

### Hover Effects
```tsx
// Scale + Glow
hover:scale-105 hover:shadow-glow-md transition-all duration-300

// Border glow
hover:border-glow

// Background fade
hover:bg-accent/5

// Classe helper
glow-hover  // Ajoute automatiquement le glow au hover
```

### Animations
```tsx
animate-fade-in      // Fade in avec slide up
animate-slide-in     // Slide from left
animate-glow-pulse   // Pulse de glow continu
```

---

## 🎨 Classes Utilitaires

### Texte Gradient
```tsx
<h1 className="text-gradient-primary">
  Titre avec gradient turquoise → vert menthe
</h1>
```

### Séparateurs
```tsx
<div className="separator" />  // Ligne fine discrète
```

### Scrollbar Hide
```tsx
<div className="scrollbar-hide overflow-auto">
  Contenu scrollable sans scrollbar visible
</div>
```

---

## 📐 Layout & Spacing

### Marges Amples
- Sections: `py-12 md:py-16 lg:py-20`
- Cards: `p-6 md:p-8`
- Gap entre éléments: `gap-6 md:gap-8`

### Border Radius
- Cards/Modals: `rounded-lg` (6px)
- Boutons: `rounded-md` (4px)
- Badges: `rounded-full`

### Grilles Symétriques
```tsx
// 2 colonnes responsive
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

// 3 colonnes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// 4 colonnes stats
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
```

---

## 💡 Exemples de Patterns

### Hero Section
```tsx
<section className="py-20 text-center">
  <h1 className="text-gradient-primary mb-4">
    Supervise Competitive Platform
  </h1>
  <p className="text-muted-foreground text-lg mb-8">
    Rejoignez la meilleure plateforme compétitive
  </p>
  <button className="btn-primary">
    Commencer
  </button>
</section>
```

### Stats Grid
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {stats.map(stat => (
    <div key={stat.label} className="stat-card">
      <div className="text-muted-foreground text-sm mb-1">{stat.label}</div>
      <div className="text-3xl font-bold">{stat.value}</div>
      {stat.change && (
        <div className="text-accent text-sm mt-1">
          +{stat.change}%
        </div>
      )}
    </div>
  ))}
</div>
```

### List avec Hover
```tsx
<div className="space-y-2">
  {items.map(item => (
    <div key={item.id} 
         className="card-game p-4 glow-hover cursor-pointer
                    transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{item.name}</span>
        <span className="text-accent">{item.value}</span>
      </div>
    </div>
  ))}
</div>
```

---

## 🚀 Transitions

### Durées Standards
- Micro-interactions: `duration-200` (200ms)
- Effets hover: `duration-300` (300ms)
- Animations modales: `duration-300`
- Ease: `ease-out` pour naturel

### Pattern Standard
```tsx
className="transition-all duration-300 ease-out"
```

---

## 🎯 Guidelines

### ✅ Do
- Utiliser les classes prédéfinies (`btn-primary`, `card-game`, etc.)
- Espacer généreusement les sections
- Ajouter des effets hover subtils
- Respecter la palette turquoise/vert menthe
- Transitions fluides (200-300ms)

### ❌ Don't
- Éviter les couleurs trop saturées
- Pas de brillance excessive
- Éviter les animations trop longues
- Ne pas mélanger trop de styles d'effets
- Éviter les borders épaisses

---

## 📦 Import

Le design system est automatiquement disponible via:
- `index.css` - Variables CSS + composants
- `tailwind.config.js` - Configuration Tailwind étendue

Aucun import supplémentaire nécessaire ! 🎉
