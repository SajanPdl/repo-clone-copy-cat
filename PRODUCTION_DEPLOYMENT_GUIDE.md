# 🚀 Production Deployment Guide for EduSanskriti

## 📋 Prerequisites

Before deploying to production, ensure you have:

- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager
- ✅ Git repository access
- ✅ Production Supabase database configured
- ✅ Web server or hosting platform ready

## 🔧 Pre-Deployment Setup

### 1. Environment Configuration

Create a `.env.production` file in your project root:

```bash
# Production Environment Configuration
NODE_ENV=production
VITE_NODE_ENV=production

# Supabase Configuration (use production keys)
VITE_SUPABASE_URL=https://your-production-supabase.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Performance Optimization
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true

# Security
VITE_ENABLE_HTTPS_REDIRECT=true
VITE_ENABLE_CSP=true

# Feature Flags
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_DEVELOPER_TOOLS=false
```

### 2. Database Migration

Ensure your production database is properly set up:

```bash
# Run the admin panel fix migration
# Copy and paste COMPLETE_ADMIN_PANEL_FIX.sql into your Supabase SQL Editor
```

## 🏗️ Building for Production

### Option 1: Automated Build Script (Recommended)

```bash
# Make the script executable
chmod +x scripts/build-production.sh

# Run the production build
./scripts/build-production.sh
```

### Option 2: Manual Build

```bash
# Install dependencies
npm ci --production=false

# Run linting and type checking
npm run lint -- --fix
npx tsc --noEmit

# Build the application
npm run build
```

## 📦 Build Output

After successful build, you'll have:

```
dist/
├── index.html              # Main HTML file
├── assets/                 # Compiled assets
│   ├── index-*.css        # Styles
│   ├── index-*.js         # JavaScript bundles
│   └── browser-*.js       # Browser polyfills
└── build-info.txt         # Build metadata
```

## 🌐 Deployment Options

### Option 1: Static Hosting (Recommended for SPA)

#### Netlify
1. Connect your Git repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy automatically on push to main branch

#### Vercel
1. Import your Git repository
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy automatically

#### GitHub Pages
1. Enable GitHub Pages in repository settings
2. Set source to GitHub Actions
3. Use the provided workflow file

### Option 2: Traditional Web Server

1. Upload `dist/` contents to your web server
2. Configure server to serve `index.html` for all routes
3. Set up proper caching headers

### Option 3: CDN Deployment

1. Upload build files to your CDN
2. Configure CDN to serve from the `dist/` directory
3. Set up proper cache invalidation

## 🔒 Security Configuration

### 1. Content Security Policy (CSP)

Add to your web server configuration:

```html
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https:; 
  font-src 'self' data:; 
  connect-src 'self' https://your-supabase.supabase.co;
```

### 2. HTTPS Enforcement

Ensure all traffic is served over HTTPS:

```nginx
# Nginx configuration
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 3. Security Headers

```nginx
# Additional security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## 📊 Performance Optimization

### 1. Compression

Enable gzip compression on your web server:

```nginx
# Nginx gzip configuration
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### 2. Caching

Set proper cache headers:

```nginx
# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Cache HTML files
location ~* \.html$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}
```

### 3. CDN Configuration

If using a CDN:
- Enable compression
- Set proper cache policies
- Configure edge locations for your target audience

## 🔍 Post-Deployment Verification

### 1. Functionality Tests

- ✅ User registration and login
- ✅ Admin panel access
- ✅ Subscription management
- ✅ File uploads and downloads
- ✅ Payment processing
- ✅ Search functionality

### 2. Performance Tests

- ✅ Page load times < 3 seconds
- ✅ Core Web Vitals compliance
- ✅ Mobile responsiveness
- ✅ Cross-browser compatibility

### 3. Security Tests

- ✅ HTTPS enforcement
- ✅ CSP compliance
- ✅ XSS protection
- ✅ CSRF protection
- ✅ SQL injection prevention

## 🚨 Monitoring and Maintenance

### 1. Error Tracking

Set up error monitoring:
- Sentry for error tracking
- Google Analytics for user behavior
- Performance monitoring tools

### 2. Regular Updates

- Keep dependencies updated
- Monitor security advisories
- Regular performance audits
- Database maintenance

### 3. Backup Strategy

- Regular database backups
- Code repository backups
- Configuration backups
- Disaster recovery plan

## 📞 Support and Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Runtime Errors**
   - Verify environment variables
   - Check Supabase connection
   - Review browser console errors

3. **Performance Issues**
   - Enable compression
   - Optimize images
   - Implement lazy loading
   - Use CDN for static assets

### Getting Help

- Check the project documentation
- Review error logs
- Test in development environment
- Contact the development team

## 🎉 Success Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Application built successfully
- [ ] Deployed to production server
- [ ] HTTPS configured and enforced
- [ ] Security headers implemented
- [ ] Performance optimized
- [ ] Monitoring configured
- [ ] Functionality verified
- [ ] Performance tested
- [ ] Security tested
- [ ] Documentation updated

---

**🎯 Your EduSanskriti application is now production-ready!**

For additional support or questions, refer to the project documentation or contact the development team.
