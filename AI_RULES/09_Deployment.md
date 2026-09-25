# 09 — Deployment Standards

> All deployment, infrastructure, and DevOps practices must follow these standards.

---

## 1. Deployment Model

### 1.1 Primary: Self-Hosted / On-Premise

| Component        | Requirement                                  |
| ---------------- | -------------------------------------------- |
| **Server OS**    | Ubuntu 22.04+ LTS or similar Linux           |
| **Web Server**   | Nginx (reverse proxy)                        |
| **PHP**          | PHP 8.3+ with FPM                            |
| **Node.js**      | Node 20+ LTS (for build only)               |
| **Database**     | MySQL 8.0+                                   |
| **Queue Worker** | Supervisor-managed Laravel queue worker       |
| **Scheduler**    | System cron for Laravel scheduler             |
| **SSL**          | Required in production (Let's Encrypt or custom) |

### 1.2 Future: Cloud Migration Path

The architecture is designed for containerization:

```
┌─────────────────────────────────────────┐
│  Docker Compose (Development)           │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │  Nginx   │ │ PHP-FPM  │ │ MySQL  │ │
│  │  :80/443 │ │  :9000   │ │ :3306  │ │
│  └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────┐ ┌──────────┐            │
│  │  Redis   │ │ Node     │            │
│  │  :6379   │ │ (build)  │            │
│  └──────────┘ └──────────┘            │
└─────────────────────────────────────────┘
```

---

## 2. Environment Configuration

### 2.1 Environment Files

```
.env.example      # Template with all variables (committed)
.env               # Local development (NOT committed)
.env.testing       # Test environment (NOT committed)
.env.production    # Production values (NOT committed, deployed separately)
```

### 2.2 Critical Production Settings

```ini
# Application
APP_NAME=Rabha
APP_ENV=production
APP_DEBUG=false
APP_URL=https://erp.domain.com
APP_TIMEZONE=UTC

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rabha_production
DB_USERNAME=rabha_app
DB_PASSWORD=<strong-password>

# Cache & Queue
CACHE_DRIVER=file
QUEUE_CONNECTION=database
SESSION_DRIVER=database
SESSION_LIFETIME=480

# Security
SANCTUM_STATEFUL_DOMAINS=erp.domain.com
SESSION_DOMAIN=.domain.com
SESSION_SECURE_COOKIE=true

# Logging
LOG_CHANNEL=daily
LOG_LEVEL=warning

# Mail (for notifications)
MAIL_MAILER=smtp
MAIL_HOST=smtp.provider.com
MAIL_PORT=587
MAIL_USERNAME=<mail-user>
MAIL_PASSWORD=<mail-password>
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@domain.com
MAIL_FROM_NAME=Rabha
```

---

## 3. Build & Deploy Process

### 3.1 Backend Deployment

```bash
#!/bin/bash
# deploy-backend.sh

set -e

echo "🚀 Deploying Rabha ERP Backend..."

# 1. Pull latest code
cd /var/www/rabha/backend
git pull origin main

# 2. Install dependencies (no dev dependencies)
composer install --no-dev --optimize-autoloader --no-interaction

# 3. Run migrations
php artisan migrate --force

# 4. Clear and rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 5. Restart queue workers
php artisan queue:restart

# 6. Restart PHP-FPM
sudo systemctl reload php8.3-fpm

echo "✅ Backend deployed successfully!"
```

### 3.2 Frontend Deployment

```bash
#!/bin/bash
# deploy-frontend.sh

set -e

echo "🚀 Building Rabha ERP Frontend..."

cd /var/www/rabha/frontend

# 1. Install dependencies
npm ci --production=false

# 2. Build production bundle
npm run build

# 3. Copy build to web server
rsync -av --delete dist/ /var/www/rabha/public/app/

echo "✅ Frontend built and deployed successfully!"
```

### 3.3 Full Deployment Checklist

```
Pre-Deployment:
□ All tests pass
□ Code reviewed and approved
□ Database migration tested on staging
□ Backup taken before deployment
□ Changelog updated

Deployment:
□ Enable maintenance mode: php artisan down
□ Pull latest code
□ Install dependencies
□ Run migrations
□ Clear caches
□ Build frontend
□ Deploy frontend assets
□ Restart queue workers
□ Disable maintenance mode: php artisan up

Post-Deployment:
□ Verify application loads
□ Verify login works
□ Check error logs
□ Verify queue processing
□ Verify scheduled tasks
□ Monitor performance for 30 minutes
```

---

## 4. Server Configuration

### 4.1 Nginx Configuration

```nginx
# /etc/nginx/sites-available/rabha

server {
    listen 80;
    server_name erp.domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name erp.domain.com;

    # SSL
    ssl_certificate /etc/ssl/certs/rabha.crt;
    ssl_certificate_key /etc/ssl/private/rabha.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Root (Laravel public directory)
    root /var/www/rabha/backend/public;
    index index.php;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;

    # Client max body size (file uploads)
    client_max_body_size 20M;

    # API routes → Laravel
    location /api {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location /sanctum {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP-FPM
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
    }

    # Frontend SPA (React)
    location / {
        root /var/www/rabha/frontend/dist;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Deny access to sensitive files
    location ~ /\.(?!well-known) {
        deny all;
    }

    location ~ \.env {
        deny all;
    }

    # Logging
    access_log /var/log/nginx/rabha-access.log;
    error_log /var/log/nginx/rabha-error.log;
}
```

### 4.2 PHP-FPM Configuration

```ini
; /etc/php/8.3/fpm/pool.d/rabha.conf

[rabha]
user = www-data
group = www-data

listen = /var/run/php/php8.3-fpm.sock
listen.owner = www-data
listen.group = www-data

pm = dynamic
pm.max_children = 50
pm.start_servers = 10
pm.min_spare_servers = 5
pm.max_spare_servers = 20
pm.max_requests = 500

; Timeouts
request_terminate_timeout = 300

; PHP settings
php_admin_value[memory_limit] = 256M
php_admin_value[upload_max_filesize] = 20M
php_admin_value[post_max_size] = 25M
php_admin_value[max_execution_time] = 300
php_admin_value[date.timezone] = UTC

; Logging
php_admin_value[error_log] = /var/log/php/rabha-error.log
php_admin_flag[log_errors] = on
```

### 4.3 Supervisor (Queue Worker)

```ini
; /etc/supervisor/conf.d/rabha-worker.conf

[program:rabha-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/rabha/backend/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/supervisor/rabha-worker.log
stopwaitsecs=3600
```

### 4.4 Cron (Laravel Scheduler)

```cron
# /etc/cron.d/rabha
* * * * * www-data cd /var/www/rabha/backend && php artisan schedule:run >> /dev/null 2>&1
```

---

## 5. Backup Strategy

### 5.1 Database Backup

```bash
#!/bin/bash
# backup-database.sh
# Run daily via cron at 02:00 AM

BACKUP_DIR="/var/backups/rabha/database"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
DB_NAME="rabha_production"
RETENTION_DAYS=30

# Create backup
mysqldump --single-transaction --routines --triggers \
  -u rabha_backup -p"${DB_BACKUP_PASSWORD}" \
  "${DB_NAME}" | gzip > "${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz"

# Remove old backups
find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "Backup completed: ${DB_NAME}_${DATE}.sql.gz"
```

### 5.2 Backup Schedule

| Backup Type      | Frequency  | Retention | Location                |
| ---------------- | ---------- | --------- | ----------------------- |
| Full database    | Daily 2AM  | 30 days   | Local + external drive  |
| File storage     | Daily 3AM  | 30 days   | Local + external drive  |
| Configuration    | Weekly     | 90 days   | Version control         |

### 5.3 Restore Procedure

Documented and tested quarterly:

```bash
# 1. Stop application
php artisan down

# 2. Restore database
gunzip < backup_file.sql.gz | mysql -u root -p rabha_production

# 3. Run any pending migrations
php artisan migrate --force

# 4. Clear caches
php artisan cache:clear
php artisan config:cache

# 5. Restart services
sudo systemctl restart php8.3-fpm
sudo supervisorctl restart rabha-worker:*

# 6. Resume application
php artisan up
```

---

## 6. Monitoring

### 6.1 Application Monitoring

| Metric                  | Alert Threshold        | Check Frequency |
| ----------------------- | ---------------------- | --------------- |
| CPU usage               | > 80% for 5 min       | 1 minute        |
| Memory usage            | > 85%                 | 1 minute        |
| Disk usage              | > 80%                 | 5 minutes       |
| PHP-FPM active workers  | > 80% of max          | 1 minute        |
| MySQL connections       | > 80% of max          | 1 minute        |
| Queue job failures      | > 0                   | 5 minutes       |
| Application error rate  | > 1% of requests      | 1 minute        |
| API response time (p95) | > 2000ms              | 1 minute        |

### 6.2 Health Check Endpoint

```php
// GET /api/health (no auth required)
// Returns system health status

Route::get('/health', function () {
    $checks = [
        'database' => DB::connection()->getPdo() !== null,
        'cache' => Cache::store()->put('health', true, 10),
        'storage' => is_writable(storage_path()),
        'queue' => Queue::size('default') < 1000,
    ];

    $healthy = !in_array(false, $checks, true);

    return response()->json([
        'status' => $healthy ? 'healthy' : 'degraded',
        'checks' => $checks,
        'timestamp' => now()->toISOString(),
    ], $healthy ? 200 : 503);
});
```

---

## 7. Docker Configuration (Development)

### 7.1 Docker Compose

```yaml
# docker-compose.yml (development only)
version: '3.8'

services:
  app:
    build:
      context: ./backend
      dockerfile: Dockerfile
    volumes:
      - ./backend:/var/www/html
    depends_on:
      - mysql
    environment:
      - APP_ENV=local
    networks:
      - rabha

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./backend/public:/var/www/html/public
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app
    networks:
      - rabha

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: rabha_local
      MYSQL_USER: rabha
      MYSQL_PASSWORD: secret
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - rabha

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_BASE_URL=http://localhost/api/v1
    networks:
      - rabha

volumes:
  mysql_data:

networks:
  rabha:
```

---

## 8. Maintenance Mode

### 8.1 Enabling Maintenance

```bash
# Standard maintenance mode
php artisan down --retry=60 --refresh=15

# With secret bypass (for testing during maintenance)
php artisan down --secret="maintenance-bypass-token"
# Access: https://erp.domain.com/maintenance-bypass-token
```

### 8.2 Maintenance Page

- Display user-friendly Arabic/English maintenance message.
- Estimate return time if known.
- Company branding visible.
- No technical details exposed.

---

## 9. Security Hardening

### 9.1 Server Hardening

- [ ] Firewall configured (UFW or iptables)
- [ ] Only ports 22 (SSH), 80, 443 open
- [ ] SSH key-only authentication (no password)
- [ ] Non-root user for application
- [ ] Automatic security updates enabled
- [ ] Fail2ban configured for SSH and application

### 9.2 Database Hardening

- [ ] Root login restricted to localhost
- [ ] Application uses least-privilege database user
- [ ] Remote database access disabled or IP-restricted
- [ ] MySQL audit plugin enabled (optional)

### 9.3 File Permissions

```bash
# Application files
chown -R www-data:www-data /var/www/rabha
find /var/www/rabha -type f -exec chmod 644 {} \;
find /var/www/rabha -type d -exec chmod 755 {} \;

# Writable directories
chmod -R 775 /var/www/rabha/backend/storage
chmod -R 775 /var/www/rabha/backend/bootstrap/cache
```
