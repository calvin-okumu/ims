# Docker Deployment Guide

## Overview

The Banking Access Control System includes comprehensive Docker support for containerized deployment. This guide covers building, running, and managing the application using Docker and Docker Compose.

## Docker Architecture

### Application Structure
```
Docker Image Structure:
├── Node.js 20 Alpine (base image)
├── Application code (/app)
├── Dependencies (node_modules)
├── SQLite database (ims.db)
├── Environment configuration
└── Health check scripts
```

### Multi-stage Build
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
CMD ["npm", "start"]
```

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd banking-access-control
```

2. **Configure environment**
```bash
cp .env.example .env.local
# Edit .env.local with your ZKBio API credentials
```

3. **Start with Docker Compose**
```bash
docker-compose up -d
```

4. **Access the application**
```
http://localhost:3000
```

### Manual Docker Commands

1. **Build the image**
```bash
docker build -t banking-access-control .
```

2. **Run the container**
```bash
docker run -d \
  --name banking-access-control \
  -p 3000:3000 \
  -e NEXT_PUBLIC_ZKBIO_API_URL=https://your-zkbio-server:8098/api \
  -e NEXT_PUBLIC_ZKBIO_API_TOKEN=your-api-token \
  banking-access-control
```

3. **Check container status**
```bash
docker ps
docker logs banking-access-control
```

## Docker Compose Configuration

### Basic Setup
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_ZKBIO_API_URL=${NEXT_PUBLIC_ZKBIO_API_URL}
      - NEXT_PUBLIC_ZKBIO_API_TOKEN=${NEXT_PUBLIC_ZKBIO_API_TOKEN}
    volumes:
      - ./data:/app/data  # For persistent SQLite database
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
```

### Production Setup
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_ZKBIO_API_URL=${NEXT_PUBLIC_ZKBIO_API_URL}
      - NEXT_PUBLIC_ZKBIO_API_TOKEN=${NEXT_PUBLIC_ZKBIO_API_TOKEN}
      - NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}
      - SENTRY_ORG=${SENTRY_ORG}
      - SENTRY_PROJECT=${SENTRY_PROJECT}
    volumes:
      - app_data:/app/data
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    networks:
      - app_network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/certs:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - app_network

volumes:
  app_data:

networks:
  app_network:
    driver: bridge
```

## Environment Configuration

### Environment Variables
```bash
# Application
NODE_ENV=production
PORT=3000

# ZKBio API
NEXT_PUBLIC_ZKBIO_API_URL=https://your-zkbio-server:8098/api
NEXT_PUBLIC_ZKBIO_API_TOKEN=your-api-token

# Monitoring (Optional)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-organization
SENTRY_PROJECT=your-project

# Database (if using external)
DATABASE_URL=file:./data/ims.db
```

### Environment File
```bash
# .env.local (for development)
NEXT_PUBLIC_ZKBIO_API_URL=https://192.168.183.114:8098/api
NEXT_PUBLIC_ZKBIO_API_TOKEN=8D1E99707293387C5B3BFC7291AD38CB
NODE_ENV=development
```

## Production Deployment

### 1. Prepare Production Build
```bash
# Build optimized production image
docker build -f Dockerfile.prod -t banking-access-control:prod .

# Or use build arguments
docker build \
  --build-arg NODE_ENV=production \
  --build-arg NEXT_PUBLIC_SENTRY_DSN=${SENTRY_DSN} \
  -t banking-access-control:prod .
```

### 2. Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  banking-access-control:
    image: banking-access-control:prod
    container_name: banking-access-control-prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.prod
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### 3. Deploy to Production
```bash
# Deploy with zero downtime
docker-compose -f docker-compose.prod.yml up -d --scale banking-access-control=2

# Check deployment
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f banking-access-control
```

## Health Checks & Monitoring

### Container Health Checks
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 30s
```

### Application Health Endpoints
- **Health Check**: `GET /api/health`
- **Metrics**: `GET /api/metrics`
- **Alerts**: `GET /api/alerts`

### Monitoring Commands
```bash
# Check container health
docker ps
docker stats banking-access-control

# View logs
docker logs -f banking-access-control

# Check health endpoint
curl http://localhost:3000/api/health

# Monitor resource usage
docker stats --no-stream banking-access-control
```

## Database Persistence

### SQLite with Docker Volumes
```yaml
services:
  app:
    volumes:
      - app_data:/app/data  # Persistent SQLite database
      - ./logs:/app/logs    # Application logs

volumes:
  app_data:
```

### External Database
```yaml
services:
  app:
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/banking_db
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=banking_db
      - POSTGRES_USER=banking_user
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

## Security Best Practices

### Docker Security
```yaml
# Use non-root user
services:
  app:
    user: "1001:1001"  # node user in Node.js Alpine

# Limit capabilities
security_opt:
  - no-new-privileges:true

# Read-only filesystem
read_only: true
tmpfs:
  - /tmp
  - /app/.next/cache
```

### Environment Security
```bash
# Use secrets for sensitive data
secrets:
  zkbio_token:
    file: ./secrets/zkbio_token.txt

services:
  app:
    secrets:
      - zkbio_token
```

### Network Security
```yaml
# Internal network only
services:
  app:
    networks:
      - internal

  nginx:
    networks:
      - public
      - internal

networks:
  internal:
    internal: true
  public:
```

## Scaling & High Availability

### Horizontal Scaling
```yaml
services:
  app:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
```

### Load Balancing
```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
    deploy:
      placement:
        constraints:
          - node.role == manager
```

## Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check logs
docker logs banking-access-control

# Check environment variables
docker exec banking-access-control env

# Test health check manually
docker exec banking-access-control curl http://localhost:3000/api/health
```

#### Database Connection Issues
```bash
# Check volume permissions
docker exec banking-access-control ls -la /app/data/

# Verify database file
docker exec banking-access-control sqlite3 /app/data/ims.db ".tables"
```

#### Memory Issues
```bash
# Check memory usage
docker stats banking-access-control

# Adjust memory limits
docker update --memory=1g --memory-swap=2g banking-access-control
```

#### Network Issues
```bash
# Check network connectivity
docker exec banking-access-control ping -c 3 google.com

# Test API connectivity
docker exec banking-access-control curl -I https://your-zkbio-server:8098
```

### Debug Commands
```bash
# Enter container shell
docker exec -it banking-access-control sh

# View real-time logs
docker logs -f banking-access-control

# Check container resource usage
docker stats banking-access-control

# Inspect container configuration
docker inspect banking-access-control
```

## Backup & Recovery

### Database Backup
```bash
# Backup SQLite database
docker exec banking-access-control sqlite3 /app/data/ims.db ".backup /tmp/backup.db"
docker cp banking-access-control:/tmp/backup.db ./backups/backup-$(date +%Y%m%d).db
```

### Automated Backups
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker exec banking-access-control sqlite3 /app/data/ims.db ".backup /tmp/backup.db"
docker cp banking-access-control:/tmp/backup.db $BACKUP_DIR/backup-$DATE.db

# Backup logs
docker cp banking-access-control:/app/logs $BACKUP_DIR/logs-$DATE

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "backup-*.db" -mtime +7 -delete
find $BACKUP_DIR -name "logs-*" -mtime +7 -delete
```

### Recovery
```bash
# Stop container
docker-compose down

# Restore database
docker cp ./backups/backup-20240115.db banking-access-control:/app/data/ims.db

# Start container
docker-compose up -d
```

## Performance Optimization

### Docker Optimization
```yaml
services:
  app:
    build:
      target: production  # Use multi-stage build
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Application Optimization
```bash
# Build optimization
NODE_OPTIONS="--max-old-space-size=4096"
NEXT_TELEMETRY_DISABLED=1

# Runtime optimization
NODE_ENV=production
```

## CI/CD Integration

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Deploy to server
      run: |
        echo "${{ secrets.SSH_PRIVATE_KEY }}" > key
        chmod 600 key
        scp -i key docker-compose.prod.yml user@server:/opt/banking/
        ssh -i key user@server "cd /opt/banking && docker-compose pull && docker-compose up -d"
```

## Next Steps

1. **Configure Environment**: Set up production environment variables
2. **Test Locally**: Run with Docker Compose in development
3. **Set Up Monitoring**: Configure health checks and alerts
4. **Implement Backups**: Set up automated backup scripts
5. **Security Hardening**: Apply security best practices
6. **Performance Tuning**: Optimize for production workloads

For additional support or questions about Docker deployment, refer to the main project documentation or contact the development team.