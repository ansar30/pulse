# Deployment Guide

This guide covers deploying the BusinessApp platform to production.

## Prerequisites

- Docker & Docker Compose
- MongoDB Atlas account (or self-hosted MongoDB)
- Domain name (optional)
- Cloud provider account (AWS, GCP, Azure, or Vercel)

## Environment Setup

### Production Environment Variables

Create a `.env.production` file:

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/businessapp?retryWrites=true&w=majority"

# JWT
JWT_SECRET="<generate-a-strong-secret-key>"
JWT_EXPIRES_IN="7d"

# Redis (if using)
REDIS_HOST="your-redis-host"
REDIS_PORT=6379
REDIS_PASSWORD="your-redis-password"

# API
API_PORT=3001
NODE_ENV="production"

# Web
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
```

### Generate Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Deployment Options

### Option 1: Deploy to Vercel (Recommended for Web)

#### Web Application

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   cd apps/web
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`

#### API (Deploy to Railway/Render)

**Using Railway:**

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login and deploy:
   ```bash
   railway login
   cd apps/api
   railway init
   railway up
   ```

3. Set environment variables in Railway dashboard

**Using Render:**

1. Create `render.yaml`:
   ```yaml
   services:
     - type: web
       name: business-app-api
       env: node
       buildCommand: cd apps/api && pnpm install && pnpm build
       startCommand: cd apps/api && pnpm start
       envVars:
         - key: DATABASE_URL
           sync: false
         - key: JWT_SECRET
           generateValue: true
   ```

2. Connect your repository to Render

---

### Option 2: Deploy with Docker

#### Build Images

```bash
# Build API
docker build -f docker/api.Dockerfile -t business-app-api:latest .

# Build Web
docker build -f docker/web.Dockerfile -t business-app-web:latest .
```

#### Push to Registry

```bash
# Tag images
docker tag business-app-api:latest your-registry/business-app-api:latest
docker tag business-app-web:latest your-registry/business-app-web:latest

# Push
docker push your-registry/business-app-api:latest
docker push your-registry/business-app-web:latest
```

#### Deploy to Cloud

**AWS ECS:**

1. Create ECS cluster
2. Create task definitions using your Docker images
3. Create services
4. Configure load balancer

**Google Cloud Run:**

```bash
# Deploy API
gcloud run deploy business-app-api \
  --image your-registry/business-app-api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Deploy Web
gcloud run deploy business-app-web \
  --image your-registry/business-app-web:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

### Option 3: Deploy to VPS (DigitalOcean, Linode, etc.)

1. **Set up server:**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh

   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Clone repository:**
   ```bash
   git clone <your-repo>
   cd chat-app
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

4. **Deploy with Docker Compose:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

5. **Set up Nginx reverse proxy:**
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }

   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Set up SSL with Let's Encrypt:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
   ```

---

## Mobile App Deployment

### iOS (App Store)

1. **Set up EAS:**
   ```bash
   cd apps/mobile
   npm install -g eas-cli
   eas login
   eas build:configure
   ```

2. **Build:**
   ```bash
   eas build --platform ios
   ```

3. **Submit to App Store:**
   ```bash
   eas submit --platform ios
   ```

### Android (Google Play)

1. **Build:**
   ```bash
   eas build --platform android
   ```

2. **Submit to Google Play:**
   ```bash
   eas submit --platform android
   ```

---

## Database Setup

### MongoDB Atlas

1. Create cluster at https://cloud.mongodb.com
2. Create database user
3. Whitelist IP addresses (or allow from anywhere for development)
4. Get connection string
5. Update `DATABASE_URL` in environment variables

### Self-Hosted MongoDB

```bash
# Using Docker
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -v mongodb_data:/data/db \
  mongo:7
```

---

## Post-Deployment

### Health Checks

Test your deployment:

```bash
# API health
curl https://api.yourdomain.com/api/v1/health

# Web
curl https://yourdomain.com
```

### Monitoring

Set up monitoring with:
- **Sentry** - Error tracking
- **DataDog** - Application monitoring
- **LogRocket** - Session replay
- **Uptime Robot** - Uptime monitoring

### Backups

**MongoDB Atlas:**
- Automatic backups enabled by default
- Configure backup schedule in Atlas dashboard

**Self-Hosted:**
```bash
# Backup script
mongodump --uri="mongodb://username:password@localhost:27017/businessapp" --out=/backups/$(date +%Y%m%d)
```

### CI/CD

The project includes GitHub Actions workflow. To enable:

1. Add secrets to GitHub repository:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - Docker registry credentials (if using)

2. Push to `main` branch to trigger deployment

---

## Scaling

### Horizontal Scaling

- Deploy multiple API instances behind a load balancer
- Use Redis for session storage
- Enable MongoDB replica set

### Caching

- Implement Redis caching for frequently accessed data
- Use CDN for static assets
- Enable Next.js caching

### Database Optimization

- Add indexes for frequently queried fields
- Use MongoDB aggregation pipelines
- Implement read replicas

---

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Set strong JWT secret
- [ ] Enable CORS with specific origins
- [ ] Set up rate limiting
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Set up WAF (Web Application Firewall)
- [ ] Enable database encryption at rest
- [ ] Implement audit logging

---

## Troubleshooting

### API Not Starting

Check logs:
```bash
docker logs business-app-api
```

Common issues:
- Database connection failed
- Missing environment variables
- Port already in use

### Web App Not Loading

- Check `NEXT_PUBLIC_API_URL` is correct
- Verify API is accessible
- Check browser console for errors

---

**For more information, see [GETTING_STARTED.md](./GETTING_STARTED.md) and [API.md](./API.md)**
