module.exports = {
  apps: [
    {
      name: 'social-affluence',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
      // PAS de section "env", "env_production", etc.
    }
  ]
};
