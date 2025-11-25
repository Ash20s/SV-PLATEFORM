# 🎨 Design System - Supervive Platforme

## 📐 Guide de Style Complet

Ce document détaille **exactement** toutes les couleurs, polices et styles utilisés pour respecter le design original.

---

## 🎨 Palette de Couleurs

### Couleurs Principales

```css
/* Rose/Magenta Primary */
--primary: #ec4899;           /* Bright Pink */
--primary-hover: #db2777;     /* Darker Pink */
--primary-light: #f9a8d4;     /* Light Pink */

/* Cyan/Turquoise Accent */
--accent-cyan: #06b6d4;       /* Bright Cyan */
--accent-cyan-light: #22d3ee; /* Light Cyan */

/* Backgrounds */
--background: #0a0a0f;        /* Very Dark Blue/Black */
--background-card: #1a1a2e;   /* Dark Card Background */
--background-elevated: #16213e; /* Slightly lighter card */

/* Borders */
--border: #2d3748;            /* Dark Gray Border */
--border-hover: #ec4899;      /* Pink on hover */
```

### Couleurs de Statut

```css
/* Success / Open */
--success: #10b981;           /* Green */
--success-bg: rgba(16, 185, 129, 0.1);

/* Warning */
--warning: #f59e0b;           /* Orange */
--warning-bg: rgba(245, 158, 11, 0.1);

/* Danger / Live */
--danger: #ef4444;            /* Red */
--danger-bg: rgba(239, 68, 68, 0.1);

/* Info */
--info: #3b82f6;              /* Blue */
--info-bg: rgba(59, 130, 246, 0.1);
```

### Couleurs de Texte

```css
--text-primary: #ffffff;      /* White */
--text-secondary: #9ca3af;    /* Light Gray */
--text-muted: #6b7280;        /* Darker Gray */
```

### Gradients

```css
/* Hero Title Gradient */
background: linear-gradient(to right, #ec4899, #db2777);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;

/* Featured Card Gradient */
background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2));

/* Button Gradient */
background: linear-gradient(to right, #ec4899, #8b5cf6);
```

---

## 🔤 Typographie

### Polices

```css
/* Police principale */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

/* Police alternative (titres) */
font-family: 'Poppins', 'Inter', sans-serif;
```

### Tailles de Police

```css
/* Hero Title */
font-size: 3.75rem;        /* 60px */
line-height: 1;
font-weight: 700;
letter-spacing: -0.025em;

/* Section Title (MAIN HUB, etc.) */
font-size: 1.875rem;       /* 30px */
line-height: 2.25rem;
font-weight: 700;
text-transform: uppercase;

/* Card Title */
font-size: 1.125rem;       /* 18px */
line-height: 1.75rem;
font-weight: 600;

/* Body Text */
font-size: 1rem;           /* 16px */
line-height: 1.5rem;
font-weight: 400;

/* Small Text */
font-size: 0.875rem;       /* 14px */
line-height: 1.25rem;
font-weight: 400;
```

---

## 🏷️ Badges

### Badge FEATURED

```css
background-color: #ec4899;
color: #ffffff;
padding: 0.25rem 0.75rem;
border-radius: 9999px;
font-size: 0.75rem;
font-weight: 700;
text-transform: uppercase;
```

### Badge LIVE

```css
background-color: #ef4444;
color: #ffffff;
padding: 0.25rem 0.5rem;
border-radius: 0.25rem;
font-size: 0.75rem;
font-weight: 700;
display: flex;
align-items: center;
gap: 0.25rem;

/* Pulsing dot */
&::before {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  background-color: #ffffff;
  border-radius: 9999px;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Badge Status (OPEN/CLOSED)

```css
/* OPEN */
background-color: rgba(16, 185, 129, 0.1);
border: 1px solid #10b981;
color: #10b981;
padding: 0.25rem 0.75rem;
border-radius: 0.25rem;
font-size: 0.75rem;
font-weight: 700;
text-transform: uppercase;

/* CLOSED */
background-color: rgba(107, 114, 128, 0.1);
border: 1px solid #6b7280;
color: #6b7280;
```

---

## 🎯 Composants

### Barre de Recherche

```css
background-color: #1a1a2e;
border: 1px solid #2d3748;
border-radius: 0.5rem;
padding: 1rem 1rem 1rem 3rem;
width: 100%;
max-width: 48rem;
color: #ffffff;
transition: border-color 0.3s;

&:focus {
  outline: none;
  border-color: #ec4899;
}

/* Icône de recherche */
position: absolute;
left: 1rem;
top: 50%;
transform: translateY(-50%);
color: #6b7280;
```

### Cards

```css
background-color: #1a1a2e;
border: 1px solid #2d3748;
border-radius: 0.5rem;
padding: 1.5rem;
transition: all 0.3s;

&:hover {
  border-color: #ec4899;
  transform: scale(1.02);
}
```

### Section MAIN HUB

```css
/* Barre latérale cyan */
border-left: 4px solid #06b6d4;
padding-left: 1rem;

/* Titre */
font-size: 1.875rem;
font-weight: 700;
text-transform: uppercase;
color: #ffffff;
```

### Featured Tournament Card

```css
background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2));
border-radius: 0.5rem;
padding: 2rem;
min-height: 250px;
display: flex;
flex-direction: column;
justify-content: space-between;

/* Badge FEATURED */
background-color: #ec4899;
color: #ffffff;
padding: 0.25rem 0.75rem;
border-radius: 9999px;
font-size: 0.75rem;
font-weight: 700;
display: inline-block;
margin-bottom: 1rem;

/* Titre */
font-size: 1.5rem;
font-weight: 700;
font-style: italic;
color: #ffffff;
margin-bottom: 0.5rem;
transition: color 0.3s;

&:hover {
  color: #ec4899;
}

/* Bouton REGISTER NOW */
background-color: #ffffff;
color: #000000;
padding: 0.5rem 1.5rem;
border-radius: 0.5rem;
font-weight: 700;
transition: background-color 0.3s;

&:hover {
  background-color: #e5e5e5;
}
```

### Calendar Preview

```css
background-color: #1a1a2e;
border: 1px solid #2d3748;
border-radius: 0.5rem;
padding: 1.5rem;

/* Icône calendrier */
color: #06b6d4;
width: 1.5rem;
height: 1.5rem;

/* Titre */
font-size: 1.25rem;
font-weight: 700;
color: #ffffff;

/* Event item */
display: flex;
align-items: center;
justify-content: space-between;
padding: 0.5rem 0;
border-bottom: 1px solid #2d3748;

&:last-child {
  border-bottom: none;
}

/* Event badge */
padding: 0.25rem 0.5rem;
border-radius: 0.25rem;
font-size: 0.75rem;
font-weight: 600;

/* Tournament badge */
background-color: rgba(236, 72, 153, 0.1);
border: 1px solid #ec4899;
color: #ec4899;

/* Scrim badge */
background-color: rgba(59, 130, 246, 0.1);
border: 1px solid #3b82f6;
color: #3b82f6;
```

### Latest Announcements

```css
background-color: #1a1a2e;
border: 1px solid #2d3748;
border-radius: 0.5rem;
padding: 1.5rem;

/* Icône megaphone */
color: #ec4899;
width: 1.5rem;
height: 1.5rem;

/* Titre */
font-size: 1.5rem;
font-weight: 700;
color: #ffffff;

/* Announcement item */
border-bottom: 1px solid #2d3748;
padding-bottom: 1rem;

&:last-child {
  border-bottom: none;
}

/* Announcement title */
font-weight: 600;
color: #ffffff;
margin-bottom: 0.25rem;

/* Announcement content */
font-size: 0.875rem;
color: #9ca3af;
margin-bottom: 0.5rem;

/* Timestamp */
font-size: 0.75rem;
color: #6b7280;
```

### Tournament Grid Cards

```css
background-color: #1a1a2e;
border: 1px solid #2d3748;
border-radius: 0.5rem;
padding: 1rem;
transition: all 0.3s;
cursor: pointer;

&:hover {
  border-color: #ec4899;
  transform: translateY(-2px);
}

/* Tournament title */
font-size: 1.125rem;
font-weight: 700;
color: #ffffff;
margin-bottom: 0.25rem;
transition: color 0.3s;

&:hover {
  color: #ec4899;
}

/* Meta info (date, participants) */
display: flex;
align-items: center;
gap: 0.5rem;
font-size: 0.875rem;
color: #6b7280;

/* Prize pool */
color: #ec4899;
font-weight: 700;
margin-top: 0.5rem;
```

### Twitch Stream Cards

```css
background-color: #1a1a2e;
border: 1px solid #2d3748;
border-radius: 0.5rem;
overflow: hidden;
transition: all 0.3s;
cursor: pointer;

&:hover {
  border-color: #ec4899;
  transform: scale(1.02);
}

/* Thumbnail */
aspect-ratio: 16/9;
background-color: #000000;
position: relative;
overflow: hidden;

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

&:hover img {
  transform: scale(1.1);
}

/* LIVE Badge */
position: absolute;
top: 0.5rem;
left: 0.5rem;
background-color: #ef4444;
color: #ffffff;
padding: 0.25rem 0.5rem;
border-radius: 0.25rem;
font-size: 0.75rem;
font-weight: 700;
display: flex;
align-items: center;
gap: 0.25rem;

/* Viewers count */
position: absolute;
top: 0.5rem;
right: 0.5rem;
background-color: rgba(0, 0, 0, 0.8);
color: #ffffff;
padding: 0.25rem 0.5rem;
border-radius: 0.25rem;
font-size: 0.75rem;
font-weight: 600;

/* Stream info */
padding: 1rem;

/* Stream title */
font-weight: 600;
font-size: 0.875rem;
color: #ffffff;
margin-bottom: 0.25rem;
line-height: 1.25;
display: -webkit-box;
-webkit-line-clamp: 2;
-webkit-box-orient: vertical;
overflow: hidden;
transition: color 0.3s;

&:hover {
  color: #ec4899;
}

/* Streamer name */
font-size: 0.75rem;
color: #9ca3af;

/* Platform username */
font-size: 0.75rem;
color: #ec4899;
font-weight: 500;
```

---

## 🎭 Animations

### Pulse (LIVE badge)

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
```

### Hover Scale

```css
transition: transform 0.3s ease-in-out;

&:hover {
  transform: scale(1.02);
}
```

### Slide In

```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

animation: slideIn 0.5s ease-out;
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
  /* 1 colonne partout */
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  /* 2 colonnes pour tournois/streams */
}

/* Desktop */
@media (min-width: 1025px) {
  /* 2-3 colonnes selon la section */
}
```

### Hero Section Responsive

```css
/* Mobile */
@media (max-width: 640px) {
  font-size: 2.5rem; /* 40px */
  padding: 3rem 1rem;
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  font-size: 3rem; /* 48px */
  padding: 4rem 2rem;
}

/* Desktop */
@media (min-width: 1025px) {
  font-size: 3.75rem; /* 60px */
  padding: 5rem 4rem;
}
```

---

## 🎯 Spacing

### Spacing Scale

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
```

### Section Spacing

```css
/* Entre sections */
margin-bottom: 2rem; /* Mobile */
margin-bottom: 3rem; /* Desktop */

/* Padding interne cards */
padding: 1rem;       /* Mobile */
padding: 1.5rem;     /* Desktop */
```

---

## ✅ Checklist Conformité Design

- [x] Couleur primaire : Rose #ec4899
- [x] Couleur accent : Cyan #06b6d4
- [x] Background : Dark #0a0a0f
- [x] Hero title gradient : Rose vers violet
- [x] Badge FEATURED : Rose
- [x] Badge LIVE : Rouge avec animation pulse
- [x] Badge OPEN : Vert avec bordure
- [x] Icône calendrier : Cyan
- [x] Icône megaphone : Rose
- [x] Barre latérale MAIN HUB : Cyan
- [x] Cards avec hover : Bordure rose
- [x] Bouton REGISTER NOW : Blanc sur fond dégradé
- [x] Grille tournois : 2 colonnes desktop
- [x] Carrousel streams : 3 items desktop
- [x] Responsive design : Mobile, Tablet, Desktop
- [x] Animations : Pulse, hover scale, transitions

---

**Design System Final - Supervive Platforme**
*Conformité 100% avec le mockup original*

