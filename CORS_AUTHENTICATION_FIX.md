# Fix pour l'erreur 401 sur /api/auth/user en production

## Problème résolu
Erreur 401 sur la route `GET /api/auth/user` en production empêchant l'authentification utilisateur.

## Cause racine
Le frontend envoyait des requêtes avec `credentials: 'include'` pour inclure les cookies de session, mais le backend n'avait pas de configuration CORS permettant les credentials cross-origin depuis le domaine de production.

## Solution implémentée

### 1. Installation du package CORS
```bash
npm install cors @types/cors
```

### 2. Configuration CORS dans server/routes.ts
```typescript
import cors from 'cors';

// Configuration CORS avant les middlewares de session et passport
app.use(cors({
  origin: [
    'https://social-affluence.com',    // Domaine de production
    'http://localhost:3000',           // Frontend de développement  
    'http://localhost:5000'            // Serveur de développement
  ],
  credentials: true  // Permet l'envoi des cookies de session
}));
```

### 3. Configuration améliorée des cookies de session
```typescript
cookie: {
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 24 * 60 * 60 * 1000 // 24 heures
}
```

## Vérification du correctif

### En développement
```bash
# Tester les en-têtes CORS
curl -H "Origin: https://social-affluence.com" -v http://localhost:5000/api/auth/user

# Réponse attendue dans les en-têtes :
# Access-Control-Allow-Origin: https://social-affluence.com
# Access-Control-Allow-Credentials: true
```

### En production
1. Ouvrir les outils de développement du navigateur
2. Se connecter via le frontend
3. Vérifier l'onglet Réseau pour les requêtes vers `/api/auth/user` :
   - **En-têtes de requête** : `Cookie: connect.sid=...`
   - **En-têtes de réponse** : 
     - `Access-Control-Allow-Origin: https://social-affluence.com`
     - `Access-Control-Allow-Credentials: true`
   - **Code de statut** : 200 (au lieu de 401)

## Points techniques importants

### Ordre des middlewares
Le middleware CORS **doit** être configuré avant les middlewares de session et passport pour fonctionner correctement.

### sameSite pour la sécurité
- `sameSite: 'none'` en production pour autoriser les requêtes cross-origin
- `sameSite: 'lax'` en développement pour la sécurité locale
- Nécessite `secure: true` en production avec HTTPS

### Domaines autorisés
- Production : `https://social-affluence.com`
- Développement : `http://localhost:3000` et `http://localhost:5000`
- Autres domaines automatiquement rejetés pour la sécurité

## Résultat
✅ Les utilisateurs peuvent maintenant s'authentifier correctement en production  
✅ Les cookies de session sont transmis cross-origin  
✅ Les en-têtes CORS appropriés sont envoyés  
✅ La sécurité est maintenue (domaines non autorisés rejetés)