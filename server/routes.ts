import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import session from "express-session";
import { passport } from "./auth";

let wss: WebSocketServer;

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Authentication routes
  const isGoogleConfigured = process.env.GOOGLE_CLIENT_ID && 
                            process.env.GOOGLE_CLIENT_SECRET && 
                            process.env.GOOGLE_CLIENT_ID !== 'demo_client_id';

  if (isGoogleConfigured) {
    app.get('/auth/google', 
      passport.authenticate('google', { scope: ['profile', 'email'] })
    );

    app.get('/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/login?error=google_auth_failed' }),
      (req, res) => {
        // Successful authentication, redirect to dashboard
        res.redirect('/dashboard');
      }
    );
  } else {
    app.get('/auth/google', (req, res) => {
      res.status(503).json({ 
        error: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.' 
      });
    });
  }

  // Login with local strategy
  app.post('/api/auth/login',
    passport.authenticate('local', { 
      successRedirect: '/dashboard',
      failureRedirect: '/login?error=invalid_credentials'
    })
  );

  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ success: true });
    });
  });

  // Get current user
  app.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
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
