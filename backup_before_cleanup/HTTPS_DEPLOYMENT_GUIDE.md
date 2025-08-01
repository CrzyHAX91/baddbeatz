# HTTPS Deployment Guide for BaddBeatz

## Overview
This guide provides step-by-step instructions for deploying the BaddBeatz website with HTTPS to ensure full security features are enabled.

## Deployment Options

### Option 1: Cloudflare Pages (Recommended)
1. **Prerequisites**
   - Cloudflare account
   - GitHub repository with your code

2. **Steps**
   ```bash
   # Build the project
   npm run build
   
   # Deploy via Cloudflare Pages
   # 1. Go to Cloudflare Dashboard > Pages
   # 2. Connect your GitHub repository
   # 3. Set build command: npm run build
   # 4. Set output directory: dist
   # 5. Deploy
   ```

3. **Benefits**
   - Automatic HTTPS
   - Global CDN
   - DDoS protection
   - Free SSL certificate

### Option 2: Vercel
1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

### Option 3: Netlify
1. **Install Netlify CLI**
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### Option 4: Traditional Hosting with Let's Encrypt
1. **Install Certbot**
   ```bash
   sudo apt-get update
   sudo apt-get install certbot
   ```

2. **Generate SSL Certificate**
   ```bash
   sudo certbot certonly --webroot -w /var/www/baddbeatz -d yourdomain.com
   ```

3. **Configure Web Server (Nginx example)**
   ```nginx
   server {
       listen 443 ssl;
       server_name yourdomain.com;
       
       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
       
       # Security headers
       add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-Frame-Options "DENY" always;
       add_header X-XSS-Protection "1; mode=block" always;
       add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline';" always;
       
       root /var/www/baddbeatz;
       index index.html;
   }
   ```

## Post-Deployment Checklist

- [ ] Verify HTTPS is working (green padlock in browser)
- [ ] Test all pages load correctly over HTTPS
- [ ] Check browser console for mixed content warnings
- [ ] Verify PWA features work (service worker, offline mode)
- [ ] Test authentication flows
- [ ] Run security scan (e.g., Mozilla Observatory)
- [ ] Update any hardcoded HTTP URLs to HTTPS
- [ ] Set up HTTP to HTTPS redirect

## Security Headers Verification

After deployment, verify security headers at:
- https://securityheaders.com
- https://observatory.mozilla.org

## Monitoring

Set up monitoring for:
- SSL certificate expiration
- Uptime monitoring
- Performance metrics
- Security alerts

---

**Last Updated:** December 2024
