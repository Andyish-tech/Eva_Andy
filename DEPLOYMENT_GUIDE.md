# KLEIN E-Commerce Backend - Deployment Guide

## Prerequisites

- Node.js 16.0.0 or higher
- MySQL 8.0 or higher
- PM2 (for production process management)
- Nginx (optional, for reverse proxy)

## Environment Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Eva_Andy
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` file with your production values:
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=klein_ecommerce

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### 4. Database Setup
```bash
# Create database and tables
npm run db:setup
```

## Development Setup

### Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Production Deployment

### 1. Using PM2 (Recommended)

Install PM2 globally:
```bash
npm install -g pm2
```

Create PM2 ecosystem file:
```bash
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'klein-ecommerce',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Start the application:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 2. Using Docker

Create `Dockerfile`:
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["npm", "start"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_USER=klein_user
      - DB_PASSWORD=secure_password
      - DB_NAME=klein_ecommerce
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=klein_ecommerce
      - MYSQL_USER=klein_user
      - MYSQL_PASSWORD=secure_password
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

Deploy with Docker:
```bash
docker-compose up -d
```

## Nginx Configuration (Optional)

Create Nginx configuration file:
```nginx
# /etc/nginx/sites-available/klein-ecommerce
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # For Socket.io
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/klein-ecommerce /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL Certificate with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Database Optimization

### MySQL Configuration
Add to `/etc/mysql/mysql.conf.d/mysqld.cnf`:
```ini
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200
query_cache_size = 64M
```

### Create Indexes
```sql
-- Additional indexes for performance
CREATE INDEX idx_products_search ON products(name, description);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_order_items_product ON order_items(product_id);
```

## Monitoring and Logging

### PM2 Monitoring
```bash
pm2 monit
pm2 logs klein-ecommerce
```

### Log Rotation
Create logrotate configuration:
```bash
# /etc/logrotate.d/klein-ecommerce
/path/to/your/app/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 node node
    postrotate
        pm2 reloadLogs
    endscript
}
```

## Security Considerations

### 1. Firewall Configuration
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Database Security
- Use strong passwords
- Restrict database access to localhost
- Create dedicated database user with limited privileges

### 3. Application Security
- Keep dependencies updated
- Use HTTPS in production
- Implement rate limiting
- Monitor for security vulnerabilities

## Backup Strategy

### Database Backup
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u klein_user -p klein_ecommerce > /backups/klein_ecommerce_$DATE.sql
find /backups -name "klein_ecommerce_*.sql" -mtime +7 -delete
```

### Automated Backup
Add to crontab:
```bash
0 2 * * * /path/to/backup-script.sh
```

## Performance Optimization

### 1. Enable Gzip Compression
Already configured in the application.

### 2. Database Connection Pooling
Configured in `src/config/database.js` with connection limits.

### 3. Caching
Consider implementing Redis for session storage and caching.

## Health Checks

### Application Health
```bash
curl http://localhost:3000/health
```

### Database Health
```bash
mysql -u klein_user -p -e "SELECT 1"
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database credentials
   - Verify database is running
   - Check network connectivity

2. **Port Already in Use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

3. **Memory Issues**
   - Increase server memory
   - Optimize database queries
   - Implement pagination

4. **High CPU Usage**
   - Monitor with PM2
   - Check for infinite loops
   - Optimize expensive operations

## Scaling Considerations

### Horizontal Scaling
- Use load balancer
- Deploy multiple instances
- Implement session storage in Redis

### Database Scaling
- Read replicas for read-heavy operations
- Database sharding for large datasets
- Consider managed database services

## Maintenance

### Regular Tasks
- Update dependencies
- Monitor logs
- Check disk space
- Review security updates
- Performance monitoring

### Update Process
```bash
git pull origin main
npm install
pm2 restart klein-ecommerce
```

## Support

For deployment issues:
1. Check application logs
2. Verify environment configuration
3. Test database connectivity
4. Review system resources

Contact the development team for additional support.
