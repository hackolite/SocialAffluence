# Production Deployment Troubleshooting Guide

## Common Causes of 502 Bad Gateway Errors

This guide helps diagnose and fix 502 Bad Gateway errors in production deployments.

### 1. Environment Variables

The application requires these environment variables for production:

- `SESSION_SECRET`: A secure random string for session management
- `GOOGLE_CLIENT_ID`: Google OAuth client ID (optional, for Google authentication)
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret (optional, for Google authentication)
- `DATABASE_URL`: PostgreSQL connection string (optional, uses memory storage if not set)

#### Setting Environment Variables

For production deployment, create a `.env` file or set environment variables:

```bash
SESSION_SECRET=your-secure-random-session-secret-here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DATABASE_URL=postgresql://username:password@host:port/database
```

### 2. Health Check Endpoint

Test if the server is running properly:

```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-25T12:35:29.317Z",
  "environment": "production",
  "uptime": 16.463850842,
  "memory": {...},
  "features": {
    "googleOAuth": true,
    "database": true,
    "sessionSecret": true
  }
}
```

### 3. Port Configuration

The application runs on port 5000 and binds to `0.0.0.0`. Ensure your reverse proxy or load balancer is configured to forward requests to port 5000.

### 4. Session Store Configuration

In production, the app uses an improved memory store. For high-traffic applications, consider using a persistent session store like Redis.

### 5. WebSocket Configuration

The app includes a WebSocket server at `/ws`. Ensure your proxy configuration supports WebSocket connections.

## Deployment Steps

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set environment variables**

3. **Start the production server:**
   ```bash
   npm run start
   ```

4. **Verify health:**
   ```bash
   curl http://localhost:5000/api/health
   ```

## Fixed Issues

- ✅ Database configuration no longer crashes when `DATABASE_URL` is not set
- ✅ Improved session store configuration for production
- ✅ Better error handling for WebSocket connections
- ✅ Added global error handlers to prevent server crashes
- ✅ Health check endpoint for monitoring server status

## If You Still Get 502 Errors

1. Check server logs for error messages
2. Verify the health endpoint responds correctly
3. Ensure all required environment variables are set
4. Check that port 5000 is accessible
5. Verify proxy/load balancer configuration
6. Test WebSocket connectivity if using real-time features