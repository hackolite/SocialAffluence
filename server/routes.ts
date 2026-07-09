import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import cookieParser from "cookie-parser";
import { passport } from "./auth";
import { storage } from "./storage";
import { saveLoginEvent } from "./db";
import { debugLogger, createDebugContext } from "@shared/debug-logger";
import nodemailer from "nodemailer";

const debugContext = createDebugContext('Routes');
let wss: WebSocketServer;

/**
 * Registers all HTTP API routes on the Express app.
 * Safe to call in serverless environments (no WebSocket, no HTTP server created).
 */
export function registerApiRoutes(app: Express): void {
  // Configure cookie parser middleware for secure cookie-based authentication
  app.use(cookieParser());

  // Initialize Passport (without session support)
  app.use(passport.initialize());

  // Helper function to set secure username cookie
  const setUsernameCookie = (res: any, username: string) => {
    res.cookie('username', username, {
      httpOnly: true, // Prevents client-side JavaScript access for security
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/' // Available throughout the app
    });
  };

  // Helper function to clear username cookie
  const clearUsernameCookie = (res: any) => {
    res.clearCookie('username', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
  };

  // Authentication routes
  const isGoogleConfigured = process.env.GOOGLE_CLIENT_ID && 
                            process.env.GOOGLE_CLIENT_SECRET && 
                            process.env.GOOGLE_CLIENT_ID !== 'demo_client_id';

  if (isGoogleConfigured) {
    app.get('/auth/google', 
      passport.authenticate('google', { scope: ['profile', 'email'] })
    );

    app.get('/auth/google/callback',
      passport.authenticate('google', { 
        failureRedirect: '/login?error=google_auth_failed',
        session: false // Disable session since we're using cookies
      }),
      async (req, res) => {
        try {
          // Get user IP address
          const userIP = (req.headers['x-forwarded-for'] as string) || 
                        (req.headers['x-real-ip'] as string) || 
                        req.connection.remoteAddress || 
                        req.socket.remoteAddress || 
                        'unknown';

          // Extract user information for logging
          const user = req.user as any;
          if (user && user.googleId) {
            // Save login event to database
            await saveLoginEvent({
              googleId: user.googleId,
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
              email: user.email,
              ip: userIP
            });
          }

          debugLogger.info(debugContext, 'Google OAuth login successful', {
            userId: user?.id,
            googleId: user?.googleId,
            email: user?.email,
            ip: userIP
          });

          // Set secure username cookie for authentication
          if (user && user.username) {
            setUsernameCookie(res, user.username);
            debugLogger.debug(debugContext, 'Username cookie set for Google OAuth user', {
              username: user.username
            });
          }

          // Successful authentication, redirect to dashboard
          res.redirect('/dashboard');
        } catch (error) {
          debugLogger.error(debugContext, 'Error in Google OAuth callback', { error });
          console.error('❌ Error in Google OAuth callback:', error);
          // Still redirect to dashboard even if logging fails
          res.redirect('/dashboard');
        }
      }
    );
  } else {
    app.get('/auth/google', (req, res) => {
      res.status(503).json({ 
        error: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.' 
      });
    });
  }

  // Logout route - clears the username cookie
  app.post('/api/auth/logout', (req, res) => {
    // Clear the username cookie
    clearUsernameCookie(res);
    debugLogger.debug(debugContext, 'Username cookie cleared during logout');
    res.json({ success: true });
  });

  // Get current user - reads username from cookie and fetches user data
  app.get('/api/auth/user', async (req, res) => {
    try {
      const username = req.cookies.username;
      
      if (!username) {
        debugLogger.debug(debugContext, 'No username cookie found');
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Fetch user data by username from storage
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        debugLogger.warn(debugContext, 'Username cookie found but user not in storage', {
          username
        });
        // Clear invalid cookie
        clearUsernameCookie(res);
        return res.status(401).json({ error: 'Invalid authentication' });
      }

      debugLogger.debug(debugContext, 'User authentication successful via cookie', {
        username: user.username,
        userId: user.id
      });

      // Return user data (without password)
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      debugLogger.error(debugContext, 'Error in /api/auth/user', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Contact form submission endpoint
  app.post('/api/contact', async (req, res) => {
    try {
      debugLogger.debug(debugContext, 'Contact form submission received', { body: req.body });
      
      const { email, message } = req.body;

      if (!email || !message) {
        debugLogger.warn(debugContext, 'Missing required fields', { email: !!email, message: !!message });
        return res.status(400).json({ error: 'Email and message are required' });
      }

      // Configure transporter from environment variables
      // Required env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
      // For Gmail: SMTP_HOST=smtp.gmail.com, SMTP_PORT=587, SMTP_USER=your@gmail.com, SMTP_PASS=your_app_password
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const contactEmail = process.env.CONTACT_EMAIL || 'loic.laureote@gmail.com';

      if (!smtpHost || !smtpUser || !smtpPass) {
        debugLogger.error(debugContext, 'SMTP configuration missing', {
          hasHost: !!smtpHost,
          hasUser: !!smtpUser,
          hasPass: !!smtpPass
        });
        return res.status(500).json({ error: 'Email service not configured' });
      }

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"SocialAffluence Contact" <${smtpUser}>`,
        to: contactEmail,
        replyTo: email,
        subject: 'Nouveau message de contact - SocialAffluence',
        text: `De : ${email}\nDate : ${new Date().toLocaleString('fr-FR')}\n\nMessage :\n${message}`,
        html: `<p><strong>De :</strong> ${email}</p><p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p><hr/><p><strong>Message :</strong></p><p>${message.replace(/\n/g, '<br/>')}</p>`,
      });

      debugLogger.debug(debugContext, 'Contact email sent successfully', {
        from: email,
        to: contactEmail,
        messageLength: message.length
      });

      res.json({ success: true });
    } catch (error: any) {
      debugLogger.error(debugContext, 'Error in /api/contact', { 
        error: error.message, 
        stack: error.stack,
        name: error.name 
      });
      res.status(500).json({ error: 'Failed to send message' });
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  registerApiRoutes(app);

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
