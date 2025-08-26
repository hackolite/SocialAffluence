import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import type { User } from "@shared/schema";
import { debugLogger, createDebugContext } from "../shared/debug-logger";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// === DEBUG CONTEXT FOR AUTHENTICATION ===
// Create debug context for authentication operations
const authContext = createDebugContext('Authentication');

// Only configure Google OAuth if credentials are provided
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CLIENT_ID !== 'demo_client_id') {
  debugLogger.info(authContext, 'Configuring Google OAuth strategy', {
    clientIdProvided: !!GOOGLE_CLIENT_ID,
    clientSecretProvided: !!GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI
  });

  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI
  }, async (accessToken, refreshToken, profile, done) => {
    const googleContext = { ...authContext, operation: 'googleOAuthCallback', googleId: profile.id };
    
    try {
      // === DEBUG: Google OAuth callback started ===
      debugLogger.info(googleContext, 'Google OAuth callback initiated', {
        profileId: profile.id,
        email: profile.emails?.[0]?.value,
        displayName: profile.displayName,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken
      });

      // Check if user already exists with this Google ID
      let user = await storage.getUserByGoogleId(profile.id);
      
      if (user) {
        debugLogger.info(googleContext, 'Existing user found by Google ID', {
          userId: user.id,
          username: user.username
        });
        return done(null, user);
      }

      // Check if user exists with this email
      const email = profile.emails?.[0]?.value;
      if (email) {
        debugLogger.debug(googleContext, 'Checking for existing user by email', { email });
        user = await storage.getUserByEmail(email);
        if (user) {
          debugLogger.info(googleContext, 'Existing user found by email - could link accounts', {
            userId: user.id,
            username: user.username,
            email: email
          });
          // Link Google ID to existing account
          // For now, we'll create a new user since our storage doesn't support updates
          // In a real app, you'd update the existing user
        }
      }

      // Create new user
      debugLogger.info(googleContext, 'Creating new user from Google profile', {
        email: email,
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
        hasAvatar: !!profile.photos?.[0]?.value
      });

      const newUser = await storage.createUser({
        username: email || `google_${profile.id}`,
        googleId: profile.id,
        email: email || undefined,
        firstName: profile.name?.givenName || undefined,
        lastName: profile.name?.familyName || undefined,
        avatar: profile.photos?.[0]?.value || undefined,
        password: undefined, // No password for Google users
      });

      debugLogger.info(googleContext, 'New user created successfully', {
        userId: newUser.id,
        username: newUser.username
      });

      return done(null, newUser);
    } catch (error) {
      // === DEBUG: Google OAuth callback error ===
      debugLogger.error(googleContext, 'Google OAuth callback failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        profileId: profile.id
      });
      return done(error, undefined);
    }
  }));
} else {
  debugLogger.warn(authContext, 'Google OAuth not configured - missing credentials', {
    hasClientId: !!GOOGLE_CLIENT_ID,
    hasClientSecret: !!GOOGLE_CLIENT_SECRET,
    isDemoClientId: GOOGLE_CLIENT_ID === 'demo_client_id'
  });
  console.log('Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables to enable Google authentication.');
}

// Configure Local Strategy (existing username/password auth)
debugLogger.info(authContext, 'Configuring Local authentication strategy');

passport.use(new LocalStrategy(async (username, password, done) => {
  const localContext = { ...authContext, operation: 'localAuthentication', username };
  
  try {
    // === DEBUG: Local authentication attempt ===
    debugLogger.info(localContext, 'Local authentication attempt', {
      username,
      hasPassword: !!password,
      passwordLength: password?.length
    });

    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      debugLogger.warn(localContext, 'User not found for local authentication', { username });
      return done(null, false, { message: 'Incorrect username or password.' });
    }

    debugLogger.debug(localContext, 'User found, checking password', {
      userId: user.id,
      hasStoredPassword: !!user.password
    });

    if (!user || user.password !== password) {
      debugLogger.warn(localContext, 'Password mismatch for local authentication', {
        userId: user?.id,
        username
      });
      return done(null, false, { message: 'Incorrect username or password.' });
    }

    debugLogger.info(localContext, 'Local authentication successful', {
      userId: user.id,
      username: user.username
    });
    
    return done(null, user);
  } catch (error) {
    // === DEBUG: Local authentication error ===
    debugLogger.error(localContext, 'Local authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      username
    });
    return done(error, undefined);
  }
}));

// Serialize user for session
debugLogger.info(authContext, 'Configuring user serialization for sessions');

passport.serializeUser((user: User, done) => {
  const serializeContext = { ...authContext, operation: 'serializeUser', userId: user.id };
  
  // === DEBUG: User serialization ===
  debugLogger.debug(serializeContext, 'Serializing user to session', {
    userId: user.id,
    username: user.username,
    googleId: user.googleId || 'none'
  });
  
  done(null, user.id);
});

// Deserialize user from session
debugLogger.info(authContext, 'Configuring user deserialization from sessions');

passport.deserializeUser(async (id: number, done) => {
  const deserializeContext = { ...authContext, operation: 'deserializeUser', userId: id };
  
  try {
    // === DEBUG: User deserialization ===
    debugLogger.debug(deserializeContext, 'Deserializing user from session', { userId: id });
    
    const user = await storage.getUser(id);
    
    if (user) {
      debugLogger.debug(deserializeContext, 'User deserialization successful', {
        userId: user.id,
        username: user.username,
        googleId: user.googleId || 'none'
      });
    } else {
      debugLogger.warn(deserializeContext, 'User not found during deserialization', { userId: id });
    }
    
    done(null, user);
  } catch (error) {
    // === DEBUG: Deserialization error ===
    debugLogger.error(deserializeContext, 'User deserialization failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: id
    });
    done(error, undefined);
  }
});

export { passport };
