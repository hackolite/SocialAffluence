import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import session from "express-session";
import cors from "cors";
import { passport } from "./auth";
import { debugLogger, createDebugContext } from "../shared/debug-logger";

let wss: WebSocketServer;

export async function registerRoutes(app: Express): Promise<Server> {
  // === DEBUG CONTEXT FOR ROUTES AND MIDDLEWARE ===
  const routesContext = createDebugContext('Routes');
  
  debugLogger.info(routesContext, 'Starting middleware configuration', {
    nodeEnv: process.env.NODE_ENV,
    hasSessionSecret: !!process.env.SESSION_SECRET
  });

  // Configure CORS middleware - must be before session and passport
  // This fixes the 401 error on /api/auth/user in production by allowing credentials (session cookies)
  // to be sent from the frontend to the backend across different origins.
  //
  // To verify this fix works:
  // 1. Deploy to production and open browser dev tools
  // 2. Login via frontend (any auth method)
  // 3. Check Network tab - requests to /api/auth/user should show:
  //    - Request headers: Cookie: connect.sid=...
  //    - Response headers: Access-Control-Allow-Origin: https://social-affluence.com
  //                       Access-Control-Allow-Credentials: true
  // 4. Response should be 200 with user data, not 401
  
  const corsConfig = {
    origin: [
      'https://social-affluence.com',    // Production domain
      'http://localhost:3000',           // Development frontend (if needed)
      'http://localhost:5000'            // Development server (for same-origin requests)
    ],
    credentials: true  // Allow cookies/session credentials to be sent
  };

  // === DEBUG: CORS middleware configuration ===
  debugLogger.info(routesContext, 'Configuring CORS middleware (BEFORE session/passport)', {
    allowedOrigins: corsConfig.origin,
    credentials: corsConfig.credentials,
    middlewareOrder: 'CORS -> Session -> Passport'
  });
  
  app.use(cors(corsConfig));

  // Configure session middleware
  const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin in production
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  // === DEBUG: Session middleware configuration ===
  debugLogger.info(routesContext, 'Configuring session middleware (AFTER CORS)', {
    hasSecret: !!sessionConfig.secret,
    secretLength: sessionConfig.secret.length,
    resave: sessionConfig.resave,
    saveUninitialized: sessionConfig.saveUninitialized,
    cookieSecure: sessionConfig.cookie.secure,
    cookieSameSite: sessionConfig.cookie.sameSite,
    cookieMaxAge: sessionConfig.cookie.maxAge,
    isProduction: process.env.NODE_ENV === 'production'
  });

  app.use(session(sessionConfig));

  // Initialize Passport
  // === DEBUG: Passport middleware configuration ===
  debugLogger.info(routesContext, 'Configuring Passport middleware (AFTER session)', {
    middlewareOrder: 'CORS -> Session -> Passport.initialize() -> Passport.session()'
  });
  
  app.use(passport.initialize());
  app.use(passport.session());

  // === DEBUG: Custom session monitoring middleware ===
  // This middleware logs session state for all requests to help diagnose session issues
  app.use((req, res, next) => {
    // Only log for authentication-related routes to avoid spam
    if (req.path.startsWith('/api/auth') || req.path.startsWith('/auth')) {
      const sessionMonitorContext = { 
        ...routesContext, 
        operation: 'sessionMonitor',
        path: req.path,
        method: req.method,
        sessionId: req.sessionID
      };
      
      debugLogger.debug(sessionMonitorContext, 'Session state monitoring', {
        path: req.path,
        method: req.method,
        sessionId: req.sessionID,
        isAuthenticated: req.isAuthenticated(),
        hasSession: !!req.session,
        sessionKeys: req.session ? Object.keys(req.session) : [],
        passportUser: req.user ? {
          id: (req.user as any).id,
          username: (req.user as any).username
        } : null,
        headers: {
          'cookie': req.get('Cookie') ? 'present' : 'missing',
          'origin': req.get('Origin'),
          'user-agent': req.get('User-Agent')?.substring(0, 50) + '...'
        },
        sessionCookie: req.session?.cookie ? {
          secure: req.session.cookie.secure,
          sameSite: req.session.cookie.sameSite,
          maxAge: req.session.cookie.maxAge,
          expires: req.session.cookie.expires
        } : null
      });
    }
    next();
  });

  // Authentication routes
  const isGoogleConfigured = process.env.GOOGLE_CLIENT_ID && 
                            process.env.GOOGLE_CLIENT_SECRET && 
                            process.env.GOOGLE_CLIENT_ID !== 'demo_client_id';

  // === DEBUG: Google OAuth configuration status ===
  debugLogger.info(routesContext, 'Checking Google OAuth configuration', {
    isGoogleConfigured,
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    isDemoClientId: process.env.GOOGLE_CLIENT_ID === 'demo_client_id'
  });

  if (isGoogleConfigured) {
    // === DEBUG: Setting up Google OAuth routes ===
    debugLogger.info(routesContext, 'Setting up Google OAuth routes');
    
    app.get('/auth/google', 
      passport.authenticate('google', { scope: ['profile', 'email'] })
    );

    app.get('/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/login?error=google_auth_failed' }),
      (req, res) => {
        const callbackContext = { 
          ...routesContext, 
          operation: 'googleCallback',
          userId: req.user ? (req.user as any).id : 'none',
          sessionId: req.sessionID
        };
        
        // === DEBUG: Google OAuth callback success ===
        debugLogger.info(callbackContext, 'Google OAuth callback successful - creating session', {
          isAuthenticated: req.isAuthenticated(),
          userId: req.user ? (req.user as any).id : 'none',
          username: req.user ? (req.user as any).username : 'none',
          sessionId: req.sessionID,
          sessionData: req.session,
          headers: {
            'user-agent': req.get('User-Agent'),
            'origin': req.get('Origin'),
            'referer': req.get('Referer')
          }
        });

        // Check if session cookie will be set
        debugLogger.debug(callbackContext, 'Session cookie configuration for Google auth', {
          cookieOptions: {
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: '24 hours'
          },
          willSetCookie: true
        });

        // Successful authentication, redirect to dashboard
        res.redirect('/dashboard');
      }
    );
  } else {
    debugLogger.warn(routesContext, 'Google OAuth not configured - providing fallback route');
    
    app.get('/auth/google', (req, res) => {
      const errorContext = { ...routesContext, operation: 'googleAuthError' };
      
      debugLogger.warn(errorContext, 'Google OAuth attempt with missing configuration', {
        clientIdExists: !!process.env.GOOGLE_CLIENT_ID,
        clientSecretExists: !!process.env.GOOGLE_CLIENT_SECRET
      });
      
      res.status(503).json({ 
        error: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.' 
      });
    });
  }

  // Login with local strategy
  debugLogger.info(routesContext, 'Setting up local authentication route');
  
  app.post('/api/auth/login',
    passport.authenticate('local', { 
      successRedirect: '/dashboard',
      failureRedirect: '/login?error=invalid_credentials'
    })
  );

  // Logout route
  debugLogger.info(routesContext, 'Setting up logout route');
  
  app.post('/api/auth/logout', (req, res) => {
    const logoutContext = { 
      ...routesContext, 
      operation: 'logout',
      userId: req.user ? (req.user as any).id : 'none',
      sessionId: req.sessionID
    };
    
    // === DEBUG: Logout attempt ===
    debugLogger.info(logoutContext, 'Logout attempt', {
      wasAuthenticated: req.isAuthenticated(),
      userId: req.user ? (req.user as any).id : 'none',
      sessionId: req.sessionID,
      sessionData: req.session
    });
    
    req.logout((err) => {
      if (err) {
        // === DEBUG: Logout error ===
        debugLogger.error(logoutContext, 'Logout failed', {
          error: err.message,
          stack: err.stack
        });
        return res.status(500).json({ error: 'Logout failed' });
      }
      
      // === DEBUG: Logout success ===
      debugLogger.info(logoutContext, 'Logout successful - session destroyed', {
        sessionDestroyed: true
      });
      
      res.json({ success: true });
    });
  });

  // Get current user
  debugLogger.info(routesContext, 'Setting up user authentication check route');
  
  app.get('/api/auth/user', (req, res) => {
    const userCheckContext = { 
      ...routesContext, 
      operation: 'checkAuthenticatedUser',
      sessionId: req.sessionID
    };
    
    // === DEBUG: Authentication check for /api/auth/user ===
    debugLogger.info(userCheckContext, 'Authentication check requested', {
      method: req.method,
      path: req.path,
      sessionId: req.sessionID,
      isAuthenticated: req.isAuthenticated(),
      hasSession: !!req.session,
      sessionData: req.session ? {
        id: req.session.id,
        cookie: req.session.cookie
      } : null,
      headers: {
        'user-agent': req.get('User-Agent'),
        'origin': req.get('Origin'),
        'referer': req.get('Referer'),
        'cookie': req.get('Cookie') ? 'present' : 'missing',
        'authorization': req.get('Authorization') ? 'present' : 'missing'
      },
      cookies: req.headers.cookie ? 'present' : 'missing'
    });

    if (req.isAuthenticated()) {
      const user = req.user as any;
      
      // === DEBUG: Authentication successful ===
      debugLogger.info(userCheckContext, 'User authenticated successfully', {
        userId: user.id,
        username: user.username,
        sessionId: req.sessionID,
        responseWillInclude: {
          id: user.id,
          username: user.username,
          email: user.email || 'none',
          googleId: user.googleId || 'none'
        }
      });
      
      res.json(req.user);
    } else {
      // === DEBUG: Authentication failed ===
      debugLogger.warn(userCheckContext, 'User not authenticated - returning 401', {
        sessionId: req.sessionID,
        hasSession: !!req.session,
        sessionCookie: req.session?.cookie,
        passportUser: req.user,
        sessionStore: req.sessionStore ? 'present' : 'missing'
      });
      
      res.status(401).json({ error: 'Not authenticated' });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        console.log('Received WebSocket message:', data);

        switch (data.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong' }));
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => console.log('WebSocket client disconnected'));
    ws.on('error', (error) => console.error('WebSocket error:', error));

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'system_status',
        status: {
          camerasActive: 3,
          isRecording: true,
          analysisRate: 1,
          aiDetectionActive: true,
          cameraConnected: true
        }
      }));
    }
  });

  return httpServer;
}

// Utilisable dans ton moteur de détection pour pousser des mises à jour
export function broadcastToClients(payload: object): void {
  if (!wss) return;

  const data = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}
