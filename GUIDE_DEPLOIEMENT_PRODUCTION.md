# 🚀 Guide de Déploiement Production 24/7

## 📋 Table des matières
- [Infrastructure recommandée](#-infrastructure-recommandée)
- [Hébergement](#-hébergement)
- [Base de données](#-base-de-données)
- [Configuration](#-configuration)
- [Monitoring](#-monitoring)
- [Sécurité](#-sécurité)
- [Coûts estimés](#-coûts-estimés)

---

## 🏗️ Infrastructure recommandée

### Architecture Optimale

```
┌─────────────────────────────────────────────────┐
│              CDN (Cloudflare)                   │
│         Cache + DDoS Protection                 │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│           Load Balancer / Reverse Proxy         │
│                 (Nginx / Caddy)                 │
└─────────────────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌──────────────┐            ┌──────────────┐
│   Frontend   │            │   Backend    │
│   (Static)   │            │   (Node.js)  │
│              │            │   + PM2      │
└──────────────┘            └──────────────┘
                                   │
                                   ▼
                            ┌──────────────┐
                            │   MongoDB    │
                            │   Replica    │
                            │   Set        │
                            └──────────────┘
```

---

## 🌐 Hébergement

### Option 1 : **VPS dédié (Recommandé pour débuter)**

**Fournisseurs recommandés :**
- **Hetzner** (meilleur rapport qualité/prix)
- **DigitalOcean** (facile à utiliser)
- **OVH** (français, RGPD)
- **Contabo** (très économique)

**Configuration minimale :**
- **CPU** : 2 vCPU
- **RAM** : 4 GB
- **SSD** : 80 GB
- **Bande passante** : Illimitée
- **Prix** : ~10-15€/mois

**Configuration recommandée :**
- **CPU** : 4 vCPU
- **RAM** : 8 GB
- **SSD** : 160 GB
- **Prix** : ~20-30€/mois

---

### Option 2 : **Cloud Platform (Pour scaling futur)**

#### **Vercel (Frontend uniquement)**
- ✅ Déploiement automatique depuis Git
- ✅ CDN global gratuit
- ✅ HTTPS automatique
- ✅ Preview deployments
- 💰 **Gratuit** jusqu'à 100 GB bande passante/mois

#### **Railway / Render (Backend + DB)**
- ✅ Déploiement simple
- ✅ Auto-scaling
- ✅ Logs centralisés
- 💰 **~10-20€/mois**

#### **Netlify + Railway**
- Frontend sur Netlify (gratuit)
- Backend sur Railway (~15€/mois)
- MongoDB Atlas (gratuit jusqu'à 512 MB)

---

### Option 3 : **Solution All-in-One**

#### **Coolify (Self-hosted)**
- Open-source, alternative à Heroku
- Installé sur votre VPS
- Interface web pour gérer les déploiements
- Support Docker
- **Gratuit** (coût du VPS uniquement)

---

## 💾 Base de données

### Option 1 : **MongoDB Atlas (Managed)**

**Avantages :**
- ✅ Maintenance automatique
- ✅ Backups automatiques
- ✅ Scaling facile
- ✅ Monitoring intégré
- ✅ Gratuit jusqu'à 512 MB

**Plans :**
- **Free (M0)** : 512 MB, parfait pour débuter
- **Shared (M2)** : 2 GB - 9$/mois
- **Dedicated (M10)** : 10 GB - 57$/mois

**Configuration recommandée pour débuter :** M0 (gratuit)

---

### Option 2 : **MongoDB Self-hosted**

**Sur votre VPS :**
```bash
# Installation MongoDB
sudo apt update
sudo apt install mongodb-org

# Configuration Replica Set (pour haute disponibilité)
# Voir script ci-dessous
```

**Avantages :**
- ✅ Contrôle total
- ✅ Pas de limite de taille
- ✅ Inclus dans le coût du VPS

**Inconvénients :**
- ❌ Maintenance manuelle
- ❌ Backups à configurer
- ❌ Monitoring à mettre en place

---

## ⚙️ Configuration de déploiement

### 1. Préparer le serveur VPS

```bash
# 1. Se connecter au serveur
ssh root@votre-ip

# 2. Mettre à jour le système
apt update && apt upgrade -y

# 3. Installer Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 4. Installer MongoDB (si self-hosted)
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org

# 5. Démarrer MongoDB
systemctl start mongod
systemctl enable mongod

# 6. Installer PM2 (Process Manager)
npm install -g pm2

# 7. Installer Nginx
apt install -y nginx

# 8. Installer Certbot (SSL gratuit)
apt install -y certbot python3-certbot-nginx

# 9. Créer un utilisateur non-root
adduser supervive
usermod -aG sudo supervive
```

---

### 2. Déployer le Backend

```bash
# 1. Se connecter en tant qu'utilisateur supervive
su - supervive

# 2. Cloner le projet
git clone https://github.com/votre-repo/SV-PLATEFORM.git
cd SV-PLATEFORM/backend

# 3. Installer les dépendances
npm install --production

# 4. Créer le fichier .env
nano .env
```

**Fichier `.env` de production :**
```env
# Base de données
MONGO_URI=mongodb://localhost:27017/supervive-platform
# OU MongoDB Atlas : mongodb+srv://user:password@cluster.mongodb.net/supervive

NODE_ENV=production

# JWT
JWT_SECRET=CHANGEZ_MOI_AVEC_UNE_LONGUE_CLE_ALEATOIRE
JWT_EXPIRE=7d

# Server
PORT=5000
CLIENT_URL=https://votre-domaine.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Twitch
TWITCH_CLIENT_ID=votre_client_id_prod
TWITCH_CLIENT_SECRET=votre_client_secret_prod
TWITCH_REDIRECT_URI=https://votre-domaine.com/settings?twitch=callback
```

```bash
# 5. Lancer avec PM2
pm2 start src/server.js --name "supervive-backend"

# 6. Configurer le démarrage automatique
pm2 startup
pm2 save

# 7. Voir les logs
pm2 logs supervive-backend
```

---

### 3. Déployer le Frontend

#### **Option A : Build et servir avec Nginx**

```bash
cd ../frontend

# 1. Créer le fichier .env.production
nano .env.production
```

```env
VITE_API_URL=https://api.votre-domaine.com/api
```

```bash
# 2. Builder le projet
npm install
npm run build

# 3. Copier les fichiers buildés
sudo mkdir -p /var/www/supervive
sudo cp -r dist/* /var/www/supervive/
sudo chown -R www-data:www-data /var/www/supervive
```

#### **Option B : Déployer sur Vercel (plus simple)**

```bash
# 1. Installer Vercel CLI
npm install -g vercel

# 2. Se connecter
vercel login

# 3. Déployer
cd frontend
vercel --prod

# 4. Configurer les variables d'environnement sur Vercel
# Dashboard → Project → Settings → Environment Variables
# VITE_API_URL=https://api.votre-domaine.com/api
```

---

### 4. Configurer Nginx (Reverse Proxy)

```bash
sudo nano /etc/nginx/sites-available/supervive
```

**Configuration Nginx :**
```nginx
# Backend API
server {
    listen 80;
    server_name api.votre-domaine.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend (si servi par Nginx)
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;
    root /var/www/supervive;
    index index.html;

    # Compression
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_comp_level 6;

    # Cache des assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Single Page Application
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Activer la configuration
sudo ln -s /etc/nginx/sites-available/supervive /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### 5. Configurer SSL (HTTPS)

```bash
# Certificats SSL gratuits avec Let's Encrypt
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com -d api.votre-domaine.com

# Renouvellement automatique (déjà configuré par défaut)
sudo certbot renew --dry-run
```

---

## 📊 Monitoring

### 1. PM2 Monitoring (Gratuit)

```bash
# Activer le monitoring PM2
pm2 install pm2-logrotate

# Voir les métriques
pm2 monit

# Dashboard web (optionnel)
pm2 link <secret_key> <public_key>
# Obtenir les clés sur : https://app.pm2.io
```

---

### 2. UptimeRobot (Gratuit)

- Site : https://uptimerobot.com
- Vérifie que votre site est en ligne
- Alertes par email/SMS si down
- **Gratuit** pour 50 monitors

**Configuration :**
1. Créer un compte
2. Ajouter un monitor HTTP(S)
3. URL : https://votre-domaine.com
4. Intervalle : 5 minutes
5. Notifications : email

---

### 3. Sentry (Erreurs Frontend/Backend)

```bash
# Installation
npm install @sentry/node @sentry/react
```

**Backend :**
```javascript
// backend/src/server.js
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "votre_dsn_sentry",
  environment: process.env.NODE_ENV,
});

// Ajouter avant vos routes
app.use(Sentry.Handlers.requestHandler());

// Ajouter après vos routes
app.use(Sentry.Handlers.errorHandler());
```

**Frontend :**
```typescript
// frontend/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "votre_dsn_sentry",
  environment: import.meta.env.MODE,
});
```

**Prix :** Gratuit jusqu'à 5K événements/mois

---

### 4. Logs

```bash
# Logs PM2
pm2 logs supervive-backend --lines 100

# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs MongoDB
sudo tail -f /var/log/mongodb/mongod.log

# Configurer la rotation des logs
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

---

## 🔒 Sécurité

### 1. Firewall (UFW)

```bash
# Installer et configurer UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

### 2. Fail2ban (Protection brute-force)

```bash
# Installer
sudo apt install fail2ban

# Configuration
sudo nano /etc/fail2ban/jail.local
```

```ini
[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
```

```bash
sudo systemctl restart fail2ban
```

---

### 3. Mises à jour automatiques

```bash
# Installer unattended-upgrades
sudo apt install unattended-upgrades

# Configurer
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

### 4. Sauvegardes MongoDB

**Script de backup automatique :**
```bash
# Créer le script
sudo nano /usr/local/bin/backup-mongo.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
mkdir -p $BACKUP_DIR

# Backup
mongodump --out $BACKUP_DIR/backup_$DATE

# Garder seulement les 7 derniers jours
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;

# (Optionnel) Uploader sur S3/B2
# aws s3 cp $BACKUP_DIR/backup_$DATE.tar.gz s3://your-bucket/
```

```bash
# Rendre exécutable
sudo chmod +x /usr/local/bin/backup-mongo.sh

# Ajouter au crontab (tous les jours à 3h du matin)
sudo crontab -e
0 3 * * * /usr/local/bin/backup-mongo.sh
```

---

## 💰 Coûts estimés

### Configuration minimale (Débutant)

| Service | Coût/mois |
|---------|-----------|
| **VPS Hetzner** (2 vCPU, 4GB RAM) | 10€ |
| **MongoDB Atlas** (M0 Free) | 0€ |
| **Domaine** (.com) | ~1€ |
| **Cloudflare** (CDN + SSL) | 0€ |
| **Vercel** (Frontend, optionnel) | 0€ |
| **Total** | **~11€/mois** |

---

### Configuration recommandée (Production)

| Service | Coût/mois |
|---------|-----------|
| **VPS Hetzner** (4 vCPU, 8GB RAM) | 25€ |
| **MongoDB Atlas** (M10 Dedicated) | 50€ |
| **Domaine** (.com) | 1€ |
| **Cloudflare Pro** (optionnel) | 20€ |
| **Sentry** (Team plan) | 26€ |
| **Backups S3** | 2€ |
| **Total** | **~124€/mois** |

---

### Configuration scaling (Haute charge)

| Service | Coût/mois |
|---------|-----------|
| **2x VPS Load Balanced** | 50€ |
| **MongoDB Atlas M30** | 150€ |
| **Cloudflare Pro** | 20€ |
| **CDN BunnyCDN** | 10€ |
| **Monitoring (Datadog)** | 30€ |
| **Total** | **~260€/mois** |

---

## 🚀 Checklist de déploiement

### Avant le lancement

- [ ] Domaine acheté et configuré
- [ ] VPS provisionné
- [ ] MongoDB configuré (Atlas ou self-hosted)
- [ ] Variables d'environnement configurées
- [ ] SSL/HTTPS activé
- [ ] Backend déployé avec PM2
- [ ] Frontend buildé et déployé
- [ ] Nginx configuré
- [ ] Firewall activé
- [ ] Fail2ban configuré
- [ ] Backups automatiques configurés
- [ ] Monitoring configuré (UptimeRobot)
- [ ] Logs configurés
- [ ] Sentry intégré
- [ ] Tests de charge effectués
- [ ] Documentation à jour

### Après le lancement

- [ ] Vérifier les logs quotidiennement (première semaine)
- [ ] Monitorer les performances
- [ ] Tester les backups
- [ ] Vérifier les alertes
- [ ] Optimiser selon les métriques

---

## 📚 Ressources

### Tutoriels
- [Digital Ocean - Deploy Node.js](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-22-04)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [MongoDB Production Notes](https://www.mongodb.com/docs/manual/administration/production-notes/)

### Outils
- [PM2](https://pm2.keymetrics.io/) - Process Manager
- [Nginx](https://nginx.org/) - Reverse Proxy
- [Certbot](https://certbot.eff.org/) - SSL gratuit
- [UptimeRobot](https://uptimerobot.com/) - Monitoring
- [Sentry](https://sentry.io/) - Error tracking

---

## 🆘 Support

En cas de problème :
1. Vérifier les logs : `pm2 logs`
2. Vérifier Nginx : `sudo nginx -t`
3. Vérifier MongoDB : `sudo systemctl status mongod`
4. Consulter UptimeRobot pour l'historique
5. Vérifier Sentry pour les erreurs applicatives

---

**Déploiement Production - Guide Complet**
*Mise à jour : Novembre 2025*

