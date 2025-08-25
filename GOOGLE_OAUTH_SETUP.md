# Configuration de l'authentification Google OAuth

Cette application supporte maintenant l'authentification via Google OAuth. Voici comment configurer cette fonctionnalité :

## Configuration Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ et l'API People (OAuth)
4. Allez dans "Credentials" > "Create Credentials" > "OAuth 2.0 Client IDs"
5. Configurez l'écran de consentement OAuth si ce n'est pas déjà fait
6. Créez un OAuth 2.0 Client ID :
   - Type d'application : Web application
   - Origines JavaScript autorisées : `http://localhost:5000` (pour le développement)
   - URIs de redirection autorisées : `http://localhost:5000/api/auth/google/callback`

## Configuration de l'application

1. Copiez le fichier `.env.example` vers `.env` :
   ```bash
   cp .env.example .env
   ```

2. Remplissez les variables dans le fichier `.env` :
   ```
   GOOGLE_CLIENT_ID=votre_client_id_google
   GOOGLE_CLIENT_SECRET=votre_client_secret_google
   SESSION_SECRET=une_clé_secrète_aléatoire_pour_les_sessions
   ```

## Utilisation

Une fois configuré, les utilisateurs peuvent :

1. **Se connecter avec Google** : Cliquez sur "Continuer avec Google" sur la page de connexion
2. **S'inscrire avec Google** : Cliquez sur "Continuer avec Google" sur la page d'inscription

Le système créera automatiquement un compte utilisateur avec les informations Google (nom, email, photo de profil).

## Routes API disponibles

- `GET /api/auth/google` - Initie l'authentification Google
- `GET /api/auth/google/callback` - Callback de retour de Google
- `POST /api/auth/login` - Connexion avec nom d'utilisateur/mot de passe
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/user` - Récupère l'utilisateur actuellement connecté

## Sécurité

- Les sessions sont sécurisées avec un secret configé
- Les mots de passe ne sont pas stockés pour les utilisateurs Google
- Les informations Google ID sont utilisées pour lier les comptes