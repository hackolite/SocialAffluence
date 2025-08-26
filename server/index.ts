import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { debugLogger, createDebugContext } from "../shared/debug-logger";
import cors from "cors"; 
const app = express();

// --- AJOUT DE LA CONFIG CORS --- //
app.use(cors({
  origin: ['https://social-affluence.com', 'http://localhost:3000'], // prod & dev
  credentials: true
}));
// --- FIN AJOUT CONFIG CORS --- //


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Debug context for server
const serverContext = createDebugContext('Server');
debugLogger.info(serverContext, 'Server initialization started');

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  const requestContext = { 
    ...serverContext, 
    operation: 'requestHandler',
    requestId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    method: req.method,
    path: req.path
  };
  
  debugLogger.debug(requestContext, 'Request received', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    query: req.query,
    userAgent: req.get('User-Agent')
  });
  
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    debugLogger.trace(requestContext, 'Response JSON captured', { response: bodyJson });
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    
    debugLogger.debug(requestContext, 'Request completed', {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      response: capturedJsonResponse
    });
    
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  debugLogger.info(serverContext, 'Starting server setup');
  
  try {
    const server = await registerRoutes(app);
    debugLogger.info(serverContext, 'Routes registered successfully');

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const errorContext = { ...serverContext, operation: 'errorHandler' };
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      debugLogger.error(errorContext, 'Request error occurred', {
        error: err,
        status,
        message,
        stack: err.stack
      });

      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      debugLogger.info(serverContext, 'Setting up Vite development server');
      await setupVite(app, server);
    } else {
      debugLogger.info(serverContext, 'Setting up static file serving');
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      debugLogger.info(serverContext, 'Server started successfully', {
        port,
        environment: app.get("env"),
        host: "0.0.0.0"
      });
      log(`serving on port ${port}`);
    });
  } catch (error) {
    debugLogger.error(serverContext, 'Server startup failed', { error });
    throw error;
  }
})();
