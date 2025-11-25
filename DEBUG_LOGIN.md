# 🔍 Guide de Débogage - Problèmes de Connexion

## ✅ Ce qui fonctionne

1. **Backend API** : ✅ OK
2. **Endpoint `/api/auth/login`** : ✅ OK
3. **Génération de token** : ✅ OK
4. **Base de données** : ✅ OK

## 🔐 Identifiants Corrects

```
Email:    admin@supervive.gg
Password: admin123
```

⚠️ **IMPORTANT** : Utilisez bien l'**EMAIL**, pas le username !

---

## 🧪 Test 1 : Page de Test HTML

1. Ouvrez ce fichier dans votre navigateur :
   ```
   file:///D:/SV site/SV-PLATEFORM/test-login.html
   ```

2. Cliquez sur "Se connecter"

3. **Si ça fonctionne** :
   - Le problème vient du frontend React
   - Passez au Test 2

4. **Si ça ne fonctionne pas** :
   - Le backend n'est peut-être pas lancé
   - Vérifiez les erreurs dans la console (F12)

---

## 🧪 Test 2 : Frontend React

### A. Vérifier la console du navigateur

1. Allez sur `http://localhost:5173/login`
2. Ouvrez la console (F12)
3. Essayez de vous connecter
4. Regardez les erreurs affichées

### B. Vérifier le localStorage

Dans la console du navigateur, tapez :
```javascript
// Voir le token actuel
localStorage.getItem('token')

// Voir l'utilisateur actuel  
JSON.parse(localStorage.getItem('auth_user'))

// Nettoyer et réessayer
localStorage.clear()
```

### C. Vérifier les requêtes réseau

1. Ouvrez l'onglet "Network" (F12)
2. Essayez de vous connecter
3. Regardez la requête vers `/api/auth/login`
4. Vérifiez :
   - Status : devrait être `200 OK`
   - Response : devrait contenir `token` et `user`

---

## 🐛 Problèmes Courants

### 1. "Invalid credentials"

**Causes possibles :**
- Mauvais email (utilisez `admin@supervive.gg`)
- Mauvais mot de passe (utilisez `admin123`)
- Vous utilisez le username au lieu de l'email

**Solution :**
```bash
cd backend
node reset-admin-password.js
```

### 2. Erreur CORS

**Symptôme :** 
```
Access to fetch at 'http://localhost:5000/api/auth/login' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution :**
Vérifiez que le backend a bien la config CORS :
```javascript
app.use(cors({ 
  origin: 'http://localhost:5173', 
  credentials: true 
}));
```

### 3. Backend non accessible

**Symptôme :**
```
Failed to fetch
net::ERR_CONNECTION_REFUSED
```

**Solution :**
```bash
# Vérifier que le backend tourne
cd backend
npm run dev
```

### 4. Token non stocké

**Symptôme :** Connexion réussie mais redirigé vers login immédiatement

**Solution :**
Vérifier dans la console :
```javascript
// Après connexion, vérifier
localStorage.getItem('token') // devrait retourner un token
localStorage.getItem('auth_user') // devrait retourner un objet user
```

---

## 🔄 Réinitialisation Complète

Si rien ne fonctionne, réinitialisez tout :

```bash
# 1. Arrêter tous les processus Node
Get-Process node | Stop-Process -Force

# 2. Nettoyer le localStorage
# Dans la console du navigateur :
localStorage.clear()

# 3. Réinitialiser le compte admin
cd backend
node reset-admin-password.js

# 4. Relancer le backend
npm run dev

# 5. Relancer le frontend (dans un autre terminal)
cd ../frontend
npm run dev

# 6. Réessayer de vous connecter
```

---

## 📞 Informations pour Debug

Si le problème persiste, fournissez ces informations :

1. **Erreur exacte** dans la console (F12)
2. **Status code** de la requête `/api/auth/login` (onglet Network)
3. **Contenu de localStorage** :
   ```javascript
   console.log({
     token: localStorage.getItem('token'),
     user: localStorage.getItem('auth_user')
   })
   ```
4. **Logs du backend** dans le terminal

---

## ✅ Checklist de Vérification

- [ ] Backend lancé sur port 5000
- [ ] Frontend lancé sur port 5173
- [ ] Email correct : `admin@supervive.gg`
- [ ] Mot de passe correct : `admin123`
- [ ] Pas d'erreur CORS dans la console
- [ ] Requête retourne status 200
- [ ] Token présent dans la réponse
- [ ] localStorage vide avant de tester
- [ ] Pas de bloqueur de popup/cookies

---

**💡 Astuce** : Utilisez la page de test HTML (`test-login.html`) pour isoler le problème !

