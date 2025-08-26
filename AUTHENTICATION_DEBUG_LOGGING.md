# Debug Logging pour l'Authentification et Gestion des Sessions

Ce document explique le système de debug logging complet ajouté pour diagnostiquer les problèmes d'authentification et de gestion de session dans l'environnement PM2.

## Configuration du Debug

### Variables d'environnement

Pour activer le debug logging, ajoutez ces variables à votre fichier `.env` :

```bash
# Activer le debug logging
DEBUG=true

# Niveau de log (ERROR=0, WARN=1, INFO=2, DEBUG=3, TRACE=4)
LOG_LEVEL=DEBUG

# Node environment
NODE_ENV=development  # ou production
```

### Activation du debug en production avec PM2

```bash
# Dans votre fichier ecosystem.config.js ou directement avec PM2
pm2 start app.js --env production -e DEBUG=true -e LOG_LEVEL=INFO
```

## Points de Debug Couverts

### 1. Configuration des Middlewares (server/routes.ts)

**Ordre des middlewares vérifiés :**
```
CORS -> Session -> Passport.initialize() -> Passport.session()
```

**Logs générés :**
- Configuration CORS avec domaines autorisés et credentials
- Configuration session avec cookies (secure, sameSite, maxAge)
- Configuration Passport et ordre d'exécution
- Vérification Google OAuth (présence des credentials)

### 2. Stratégies d'Authentification (server/auth.ts)

#### Google OAuth Strategy
**Logs pour chaque callback Google :**
```json
{
  "profileId": "google_user_id",
  "email": "user@example.com", 
  "displayName": "User Name",
  "hasAccessToken": true,
  "hasRefreshToken": true
}
```

#### Stratégie Locale
**Logs pour chaque tentative de connexion :**
```json
{
  "username": "user123",
  "hasPassword": true,
  "passwordLength": 8,
  "userId": 42
}
```

### 3. Sérialisation/Désérialisation des Sessions

**Logs pour chaque opération de session :**
- Sérialisation utilisateur vers session
- Désérialisation session vers utilisateur
- Erreurs de désérialisation (utilisateur non trouvé)

### 4. Monitoring des Sessions sur Routes Protégées

**Middleware de monitoring automatique :**
- Active sur tous les chemins `/api/auth/*` et `/auth/*`
- Logs l'état de la session à chaque requête

**Informations capturées :**
```json
{
  "sessionId": "connect.sid_value",
  "isAuthenticated": false,
  "hasSession": true,
  "sessionKeys": ["cookie", "passport"],
  "passportUser": { "id": 42, "username": "user123" },
  "headers": {
    "cookie": "present",
    "origin": "https://social-affluence.com"
  },
  "sessionCookie": {
    "secure": true,
    "sameSite": "none",
    "maxAge": 86400000
  }
}
```

### 5. Route `/api/auth/user` - Vérification d'Authentification

**Debug complet pour chaque requête :**
- État d'authentification (`req.isAuthenticated()`)
- Présence et contenu de la session
- Headers de la requête (Cookie, Origin, User-Agent)
- Configuration des cookies de session
- Raison du succès/échec de l'authentification

### 6. Processus de Logout

**Logs pour chaque déconnexion :**
- État avant logout (utilisateur, session)
- Succès/échec de la destruction de session
- Erreurs pendant le logout

## Exemples de Logs dans PM2

### Démarrage du serveur
```
[2025-08-26T13:12:03.221Z] INFO [component=Routes] Configuring CORS middleware (BEFORE session/passport)
Data: {
  "allowedOrigins": ["https://social-affluence.com", "http://localhost:3000"],
  "credentials": true,
  "middlewareOrder": "CORS -> Session -> Passport"
}
```

### Requête non-authentifiée
```
[2025-08-26T13:11:08.093Z] WARN [component=Routes operation=checkAuthenticatedUser] User not authenticated - returning 401
Data: {
  "sessionId": "iH6Uis_wxv81gcuvtHyK83kHjzB_GNXg",
  "hasSession": true,
  "sessionCookie": {
    "secure": false,
    "sameSite": "lax",
    "maxAge": 86400000
  }
}
```

### Callback Google OAuth réussi
```
[2025-08-26T13:15:42.123Z] INFO [component=Routes operation=googleCallback] Google OAuth callback successful - creating session
Data: {
  "isAuthenticated": true,
  "userId": 42,
  "username": "user@gmail.com",
  "sessionId": "new_session_id",
  "cookieOptions": {
    "secure": true,
    "sameSite": "none"
  }
}
```

## Diagnostic des Problèmes Courants

### 1. Cookie de session non envoyé depuis le frontend

**Vérifiez dans les logs :**
```
headers.cookie: "missing"
```

**Causes possibles :**
- CORS mal configuré (`credentials: true` manquant)
- Frontend n'envoie pas `credentials: 'include'`
- Domaine non autorisé dans CORS

### 2. Session créée mais utilisateur non authentifié

**Vérifiez dans les logs :**
```
hasSession: true
isAuthenticated: false
passportUser: null
```

**Causes possibles :**
- Problème de désérialisation utilisateur
- Utilisateur supprimé de la base de données
- Secret de session changé

### 3. Redirect après Google OAuth mais pas de session

**Vérifiez dans les logs :**
```
operation: "googleCallback"
isAuthenticated: true  // mais pas dans les requêtes suivantes
```

**Causes possibles :**
- Configuration cookie incompatible (secure/sameSite)
- Session store non persistant
- Problème de domaine dans les cookies

### 4. CORS Errors en production

**Vérifiez dans les logs :**
```
allowedOrigins: ["https://social-affluence.com"]
headers.origin: "https://other-domain.com"
```

**Solution :** Ajouter le domaine manquant à la liste CORS

## Suppression du Debug Logging

Tous les blocs de debug sont marqués avec des commentaires `=== DEBUG:` pour faciliter leur identification et suppression :

```typescript
// === DEBUG: Google OAuth callback started ===
debugLogger.info(googleContext, 'Google OAuth callback initiated', {
  profileId: profile.id,
  email: profile.emails?.[0]?.value
});
```

Pour supprimer le debug logging :
1. Rechercher tous les commentaires `=== DEBUG:`
2. Supprimer les appels `debugLogger.*` correspondants
3. Supprimer les imports et contextes debug si plus utilisés

## Performance en Production

- Le debug logging est automatiquement désactivé si `DEBUG=false` ou absent
- Aucun impact performance quand désactivé
- Les logs ERROR restent toujours actifs pour les erreurs critiques

## Sécurité

**Informations JAMAIS loggées :**
- Mots de passe en clair
- Secrets de session complets
- Tokens d'accès Google complets
- Informations sensibles utilisateur

**Informations loggées :**
- IDs utilisateur (safe)
- Adresses email (safe en développement)
- État des sessions (safe)
- Configuration des middlewares (safe)