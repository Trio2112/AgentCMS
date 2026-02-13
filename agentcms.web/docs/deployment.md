# AgentCMS Admin Portal - Deployment Guide

## Overview

This document provides comprehensive instructions for deploying the AgentCMS Admin Portal to production environments.

## Prerequisites

- Node.js 18+ and npm 9+
- Backend API deployed and accessible
- SSL certificate for HTTPS
- Domain name configured (e.g., admin.agentcms.com)

---

## Environment Configuration

### Environment Variables

Create a `.env.production` file in the project root:

```bash
# API Configuration
VITE_API_BASE_URL=https://api.agentcms.com
VITE_API_TIMEOUT=30000

# Authentication
VITE_AUTH_TOKEN_KEY=agentcms_auth_token

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true

# Performance
VITE_MAX_UPLOAD_SIZE=10485760  # 10MB in bytes
VITE_PAGE_SIZE=20

# External Services (optional)
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `https://api.agentcms.com` |
| `VITE_AUTH_TOKEN_KEY` | LocalStorage key for auth token | `agentcms_auth_token` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_TIMEOUT` | API request timeout (ms) | `30000` |
| `VITE_MAX_UPLOAD_SIZE` | Max file upload size (bytes) | `10485760` |
| `VITE_PAGE_SIZE` | Items per page | `20` |

---

## Build Process

### 1. Install Dependencies

```bash
npm ci --production=false
```

### 2. Run Tests

```bash
# Unit and component tests
npm run test

# E2E tests (requires running dev server)
npm run test:e2e

# Accessibility tests
npm run test:a11y

# Performance tests
npm run test:performance
```

### 3. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory:

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── react-vendor-[hash].js
│   ├── query-vendor-[hash].js
│   ├── index-[hash].css
│   └── ...
└── ...
```

### 4. Preview Build (Optional)

```bash
npm run preview
```

Access at `http://localhost:4173` to verify the production build locally.

---

## Deployment Options

### Option 1: Static Hosting (Recommended)

#### Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Configure environment variables in Vercel dashboard

#### Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy --prod --dir=dist
   ```

3. Configure environment variables in Netlify dashboard

#### AWS S3 + CloudFront

1. Build the application:
   ```bash
   npm run build
   ```

2. Upload to S3:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. Invalidate CloudFront cache:
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
   ```

### Option 2: Docker Container

#### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### Build and Run

```bash
# Build image
docker build -t agentcms-admin:latest .

# Run container
docker run -d -p 80:80 --name agentcms-admin agentcms-admin:latest
```

### Option 3: Kubernetes

#### deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agentcms-admin
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agentcms-admin
  template:
    metadata:
      labels:
        app: agentcms-admin
    spec:
      containers:
      - name: agentcms-admin
        image: your-registry/agentcms-admin:latest
        ports:
        - containerPort: 80
        env:
        - name: VITE_API_BASE_URL
          value: "https://api.agentcms.com"
---
apiVersion: v1
kind: Service
metadata:
  name: agentcms-admin-service
spec:
  selector:
    app: agentcms-admin
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
```

Deploy:

```bash
kubectl apply -f deployment.yaml
```

---

## Post-Deployment Checklist

### 1. Verify Core Functionality

- [ ] Login/authentication works
- [ ] Sites CRUD operations work
- [ ] Pages CRUD operations work
- [ ] Assets upload/delete works
- [ ] Navigation between routes works
- [ ] Error messages display correctly

### 2. Performance Verification

- [ ] Page load time <3s (use Lighthouse)
- [ ] Bundle sizes are optimized
- [ ] Images are lazy loaded
- [ ] API calls are cached appropriately

### 3. Accessibility Verification

- [ ] WCAG 2.1 Level AA compliance (use axe-core)
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Focus indicators visible

### 4. Security Verification

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CORS configured correctly
- [ ] Auth tokens stored securely
- [ ] XSS/CSRF protections enabled

### 5. Monitoring Setup

- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (Google Analytics)
- [ ] Uptime monitoring enabled
- [ ] Performance monitoring enabled

---

## Monitoring and Logging

### Error Tracking (Sentry)

1. Install Sentry:
   ```bash
   npm install @sentry/react @sentry/tracing
   ```

2. Configure in `src/main.tsx`:
   ```typescript
   import * as Sentry from '@sentry/react'

   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: import.meta.env.MODE,
     tracesSampleRate: 1.0,
   })
   ```

### Analytics (Google Analytics)

1. Add GA script to `index.html`:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'YOUR_GA_ID');
   </script>
   ```

### Health Check Endpoint

Create a `health.json` file in `public/`:

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## Rollback Procedure

### Vercel/Netlify

1. Go to deployment dashboard
2. Select previous successful deployment
3. Click "Promote to Production"

### Docker

```bash
# Tag current image as backup
docker tag agentcms-admin:latest agentcms-admin:backup

# Pull previous version
docker pull your-registry/agentcms-admin:previous-tag

# Stop and remove current container
docker stop agentcms-admin
docker rm agentcms-admin

# Run previous version
docker run -d -p 80:80 --name agentcms-admin your-registry/agentcms-admin:previous-tag
```

### Kubernetes

```bash
# Rollback to previous revision
kubectl rollout undo deployment/agentcms-admin

# Rollback to specific revision
kubectl rollout undo deployment/agentcms-admin --to-revision=2
```

---

## Troubleshooting

### Common Issues

#### 1. API Connection Errors

**Symptom**: "Network connection error" messages

**Solution**:
- Verify `VITE_API_BASE_URL` is correct
- Check CORS configuration on backend
- Verify SSL certificates

#### 2. Blank Page After Deployment

**Symptom**: White screen, no errors in console

**Solution**:
- Check base path in `vite.config.ts`
- Verify all assets are loaded correctly
- Check for JavaScript errors in browser console

#### 3. Routes Not Working (404 on Refresh)

**Symptom**: 404 error when refreshing non-root routes

**Solution**:
- Configure server to route all requests to `index.html`
- For Nginx: Use `try_files $uri $uri/ /index.html`
- For Apache: Use `.htaccess` with `RewriteRule`

#### 4. Environment Variables Not Working

**Symptom**: `undefined` values for environment variables

**Solution**:
- Ensure variables are prefixed with `VITE_`
- Rebuild application after changing `.env` files
- Verify variables are set in deployment platform

---

## Maintenance

### Regular Tasks

- **Weekly**: Review error logs and fix critical issues
- **Monthly**: Update dependencies (`npm outdated`, `npm update`)
- **Quarterly**: Run full security audit (`npm audit`)
- **Annually**: Review and update SSL certificates

### Backup Strategy

1. **Code**: Use Git tags for each release
2. **Configuration**: Store environment variables in secure vault
3. **Deployments**: Keep last 5 successful deployments

---

## Support

For deployment issues or questions:

- **Documentation**: [https://vitejs.dev/guide/](https://vitejs.dev/guide/)
- **Repository**: [Your repo URL]
- **Email**: support@agentcms.com

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-01 | Initial release |
