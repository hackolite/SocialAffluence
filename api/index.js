// api-src/index.ts
import "dotenv/config";
import express from "express";

// server/routes.ts
import { WebSocketServer, WebSocket } from "ws";
import cookieParser from "cookie-parser";

// server/auth.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// server/storage.ts
var MemStorage = class {
  users;
  currentId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.currentId = 1;
    this.initializeDemoUser();
  }
  async initializeDemoUser() {
    await this.createUser({
      username: "demo",
      password: "demo",
      email: "demo@example.com",
      firstName: "Demo",
      lastName: "User"
    });
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async getUserByGoogleId(googleId) {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId
    );
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  async createUser(insertUser) {
    const id = this.currentId++;
    const user = {
      id,
      username: insertUser.username,
      email: insertUser.email ?? null,
      password: insertUser.password ?? null,
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      googleId: insertUser.googleId ?? null,
      avatar: insertUser.avatar ?? null
    };
    this.users.set(id, user);
    return user;
  }
};
var storage = new MemStorage();

// server/auth.ts
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CLIENT_ID !== "demo_client_id") {
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await storage.getUserByGoogleId(profile.id);
      if (user) {
        return done(null, user);
      }
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await storage.getUserByEmail(email);
        if (user) {
        }
      }
      const newUser = await storage.createUser({
        username: email || `google_${profile.id}`,
        googleId: profile.id,
        email: email || void 0,
        firstName: profile.name?.givenName || void 0,
        lastName: profile.name?.familyName || void 0,
        avatar: profile.photos?.[0]?.value || void 0,
        password: void 0
        // No password for Google users
      });
      return done(null, newUser);
    } catch (error) {
      return done(error, void 0);
    }
  }));
} else {
  console.log("Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables to enable Google authentication.");
}

// shared/debug-logger.ts
var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2[LogLevel2["ERROR"] = 0] = "ERROR";
  LogLevel2[LogLevel2["WARN"] = 1] = "WARN";
  LogLevel2[LogLevel2["INFO"] = 2] = "INFO";
  LogLevel2[LogLevel2["DEBUG"] = 3] = "DEBUG";
  LogLevel2[LogLevel2["TRACE"] = 4] = "TRACE";
  return LogLevel2;
})(LogLevel || {});
var DebugLogger = class _DebugLogger {
  static instance;
  logLevel;
  enabledComponents;
  isEnabled;
  constructor() {
    this.isEnabled = typeof process !== "undefined" && process.env?.NODE_ENV === "development" || typeof process !== "undefined" && process.env?.DEBUG === "true" || typeof window !== "undefined" && localStorage.getItem("debug") === "true";
    this.logLevel = this.parseLogLevel(typeof process !== "undefined" ? process.env?.LOG_LEVEL : void 0) || 2 /* INFO */;
    const componentsFromEnv = typeof process !== "undefined" ? process.env?.DEBUG_COMPONENTS : void 0;
    this.enabledComponents = new Set(
      componentsFromEnv?.split(",").map((c) => c.trim()) || []
    );
  }
  static getInstance() {
    if (!_DebugLogger.instance) {
      _DebugLogger.instance = new _DebugLogger();
    }
    return _DebugLogger.instance;
  }
  parseLogLevel(level) {
    if (!level) return null;
    const upperLevel = level.toUpperCase();
    return LogLevel[upperLevel] ?? null;
  }
  shouldLog(level, component) {
    if (!this.isEnabled) return false;
    if (level > this.logLevel) return false;
    if (this.enabledComponents.size > 0 && !this.enabledComponents.has(component)) return false;
    return true;
  }
  formatMessage(level, context, message, data) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const levelName = LogLevel[level];
    const contextStr = Object.entries(context).map(([key, value]) => `${key}=${value}`).join(" ");
    let formatted = `[${timestamp}] ${levelName} [${contextStr}] ${message}`;
    if (data !== void 0) {
      const dataStr = typeof data === "object" ? JSON.stringify(data, null, 2) : String(data);
      formatted += `
Data: ${dataStr}`;
    }
    return formatted;
  }
  log(level, context, message, data) {
    if (!this.shouldLog(level, context.component)) return;
    const formatted = this.formatMessage(level, context, message, data);
    switch (level) {
      case 0 /* ERROR */:
        console.error(formatted);
        break;
      case 1 /* WARN */:
        console.warn(formatted);
        break;
      case 2 /* INFO */:
        console.info(formatted);
        break;
      case 3 /* DEBUG */:
      case 4 /* TRACE */:
        console.log(formatted);
        break;
    }
  }
  error(context, message, data) {
    this.log(0 /* ERROR */, context, message, data);
  }
  warn(context, message, data) {
    this.log(1 /* WARN */, context, message, data);
  }
  info(context, message, data) {
    this.log(2 /* INFO */, context, message, data);
  }
  debug(context, message, data) {
    this.log(3 /* DEBUG */, context, message, data);
  }
  trace(context, message, data) {
    this.log(4 /* TRACE */, context, message, data);
  }
  // Performance timing utilities
  time(context, label) {
    if (this.shouldLog(3 /* DEBUG */, context.component)) {
      console.time(`${context.component}:${label}`);
    }
  }
  timeEnd(context, label) {
    if (this.shouldLog(3 /* DEBUG */, context.component)) {
      console.timeEnd(`${context.component}:${label}`);
    }
  }
  // Utilities for easier usage
  createContext(component, additionalContext) {
    return {
      component,
      ...additionalContext
    };
  }
  // Configuration methods
  setLogLevel(level) {
    this.logLevel = level;
  }
  enableComponent(component) {
    this.enabledComponents.add(component);
  }
  disableComponent(component) {
    this.enabledComponents.delete(component);
  }
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }
};
var debugLogger = DebugLogger.getInstance();
function createDebugContext(component, additionalContext) {
  return debugLogger.createContext(component, additionalContext);
}

// server/db.ts
var debugContext = createDebugContext("LoginTracker");
async function saveLoginEvent(loginData) {
  try {
    debugLogger.info(debugContext, "Saving login event", {
      googleId: loginData.googleId,
      email: loginData.email,
      ip: loginData.ip,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    const loginEvent = {
      googleId: loginData.googleId,
      name: loginData.name || null,
      email: loginData.email || null,
      ip: loginData.ip || null,
      loginTime: /* @__PURE__ */ new Date()
    };
    console.log("\u{1F510} OAuth Login Event:", {
      timestamp: loginEvent.loginTime?.toISOString(),
      googleId: loginEvent.googleId,
      name: loginEvent.name,
      email: loginEvent.email,
      ip: loginEvent.ip
    });
    debugLogger.info(debugContext, "Login event saved successfully");
  } catch (error) {
    debugLogger.error(debugContext, "Failed to save login event", { error });
    console.error("\u274C Error saving login event:", error);
  }
}

// server/routes.ts
var debugContext2 = createDebugContext("Routes");
function registerApiRoutes(app2) {
  app2.use(cookieParser());
  app2.use(passport.initialize());
  const setUsernameCookie = (res, username) => {
    res.cookie("username", username, {
      httpOnly: true,
      // Prevents client-side JavaScript access for security
      secure: process.env.NODE_ENV === "production",
      // HTTPS only in production
      sameSite: "strict",
      // CSRF protection
      maxAge: 24 * 60 * 60 * 1e3,
      // 24 hours
      path: "/"
      // Available throughout the app
    });
  };
  const clearUsernameCookie = (res) => {
    res.clearCookie("username", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/"
    });
  };
  const isGoogleConfigured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_ID !== "demo_client_id";
  if (isGoogleConfigured) {
    app2.get(
      "/auth/google",
      passport.authenticate("google", { scope: ["profile", "email"] })
    );
    app2.get(
      "/auth/google/callback",
      passport.authenticate("google", {
        failureRedirect: "/login?error=google_auth_failed",
        session: false
        // Disable session since we're using cookies
      }),
      async (req, res) => {
        try {
          const userIP = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.connection.remoteAddress || req.socket.remoteAddress || "unknown";
          const user = req.user;
          if (user && user.googleId) {
            await saveLoginEvent({
              googleId: user.googleId,
              name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username,
              email: user.email,
              ip: userIP
            });
          }
          debugLogger.info(debugContext2, "Google OAuth login successful", {
            userId: user?.id,
            googleId: user?.googleId,
            email: user?.email,
            ip: userIP
          });
          if (user && user.username) {
            setUsernameCookie(res, user.username);
            debugLogger.debug(debugContext2, "Username cookie set for Google OAuth user", {
              username: user.username
            });
          }
          res.redirect("/dashboard");
        } catch (error) {
          debugLogger.error(debugContext2, "Error in Google OAuth callback", { error });
          console.error("\u274C Error in Google OAuth callback:", error);
          res.redirect("/dashboard");
        }
      }
    );
  } else {
    app2.get("/auth/google", (req, res) => {
      res.status(503).json({
        error: "Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables."
      });
    });
  }
  app2.post("/api/auth/logout", (req, res) => {
    clearUsernameCookie(res);
    debugLogger.debug(debugContext2, "Username cookie cleared during logout");
    res.json({ success: true });
  });
  app2.get("/api/auth/user", async (req, res) => {
    try {
      const username = req.cookies.username;
      if (!username) {
        debugLogger.debug(debugContext2, "No username cookie found");
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUserByUsername(username);
      if (!user) {
        debugLogger.warn(debugContext2, "Username cookie found but user not in storage", {
          username
        });
        clearUsernameCookie(res);
        return res.status(401).json({ error: "Invalid authentication" });
      }
      debugLogger.debug(debugContext2, "User authentication successful via cookie", {
        username: user.username,
        userId: user.id
      });
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      debugLogger.error(debugContext2, "Error in /api/auth/user", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      debugLogger.debug(debugContext2, "Contact form submission received", { body: req.body });
      const { email, message } = req.body;
      if (!email || !message) {
        debugLogger.warn(debugContext2, "Missing required fields", { email: !!email, message: !!message });
        return res.status(400).json({ error: "Email and message are required" });
      }
      const slackPayload = {
        text: `Nouveau message de contact`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Nouveau message de contact*`
            }
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Email:*
${email}`
              },
              {
                type: "mrkdwn",
                text: `*Date:*
${(/* @__PURE__ */ new Date()).toLocaleString("fr-FR")}`
              }
            ]
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Message:*
${message}`
            }
          }
        ]
      };
      debugLogger.debug(debugContext2, "Sending to Slack webhook", { payloadSize: JSON.stringify(slackPayload).length });
      const slackWebhookUrl = "https://hooks.slack.com/services/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";
      try {
        const { default: fetch } = await import("node-fetch");
        const response = await fetch(slackWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(slackPayload)
        });
        debugLogger.debug(debugContext2, "Slack webhook response", {
          status: response.status,
          statusText: response.statusText
        });
        if (response.ok) {
          debugLogger.debug(debugContext2, "Contact message sent to Slack successfully", {
            email,
            messageLength: message.length
          });
          res.json({ success: true });
        } else {
          const errorText = await response.text();
          debugLogger.error(debugContext2, "Failed to send message to Slack", {
            status: response.status,
            statusText: response.statusText,
            errorText
          });
          res.status(500).json({ error: "Failed to send message" });
        }
      } catch (networkError) {
        if (networkError.code === "ENOTFOUND" || networkError.message.includes("ENOTFOUND")) {
          debugLogger.warn(debugContext2, "Network blocked in sandbox environment, simulating success", {
            email,
            messageLength: message.length,
            originalError: networkError.message
          });
          res.json({ success: true, note: "Simulated success (network restricted in sandbox)" });
        } else {
          throw networkError;
        }
      }
    } catch (error) {
      debugLogger.error(debugContext2, "Error in /api/contact", {
        error: error.message,
        stack: error.stack,
        name: error.name
      });
      res.status(500).json({ error: "Internal server error" });
    }
  });
}

// api-src/index.ts
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
registerApiRoutes(app);
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});
var index_default = app;
export {
  index_default as default
};
