module.exports = {
  apps: [
    // Backend API Server
    {
      name: 'feelgood-backend',
      script: './backend/server.js',
      cwd: '/Users/mertcanyuksel/event-management-system',
      env: {
        NODE_ENV: 'production',
        PORT: 2025
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },

    // Frontend Static Server
    {
      name: 'feelgood-frontend',
      script: 'serve',
      args: '-s build -l 2026',
      cwd: '/Users/mertcanyuksel/event-management-system/frontend',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
