// PM2 ecosystem configuration with authentication debug logging
module.exports = {
  apps: [
    {
      name: 'social-affluence',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        // Normal production - debug disabled
        DEBUG: 'false',
        LOG_LEVEL: 'ERROR'
      },
      env_debug: {
        NODE_ENV: 'production',
        PORT: 5000,
        // Debug mode for troubleshooting authentication issues
        DEBUG: 'true',
        LOG_LEVEL: 'INFO',  // Use INFO in production to avoid log spam
        // Add your production environment variables here
        GOOGLE_CLIENT_ID: 'your_production_google_client_id',
        GOOGLE_CLIENT_SECRET: 'your_production_google_client_secret',
        GOOGLE_REDIRECT_URI: 'https://social-affluence.com/auth/google/callback',
        SESSION_SECRET: 'your_production_session_secret'
      }
    }
  ]
};

// Usage examples:
//
// Normal production (debug disabled):
// pm2 start ecosystem.config.js --env production
//
// Debug mode for authentication troubleshooting:
// pm2 start ecosystem.config.js --env debug
// 
// View debug logs in real-time:
// pm2 logs social-affluence --lines 100
//
// Search for specific authentication issues:
// pm2 logs social-affluence | grep "Authentication\|Routes"
// pm2 logs social-affluence | grep "ERROR\|WARN"
//
// Restart with debug mode when issues occur:
// pm2 restart social-affluence --env debug
// pm2 logs social-affluence --lines 50
//
// Return to normal mode after diagnosis:
// pm2 restart social-affluence --env production