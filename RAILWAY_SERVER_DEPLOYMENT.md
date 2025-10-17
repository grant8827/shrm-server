# Railway Server Deployment Checklist

## ❌ Server Not Running - Troubleshooting Guide

### 1. **Railway Environment Variables**
Set these in Railway Dashboard > Variables:

```bash
NODE_ENV=production
PORT=8080
JWT_SECRET=shrm_production_jwt_secret_key_2024_very_secure
JWT_EXPIRE=30d
EMAIL_HOST=webhosting2023.is.cc
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=info@safehavenrestorationministries.com
EMAIL_PASS=[YOUR_EMAIL_PASSWORD]
CONTACT_EMAIL=info@safehavenrestorationministries.com
ADMIN_EMAIL=info@safehavenrestorationministries.com
CLIENT_URL=https://your-netlify-domain.netlify.app
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
MAX_FILE_SIZE=10000000
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

### 2. **MongoDB Connection**
- Railway will auto-provide `MONGODB_URI` when you add MongoDB service
- Or use your existing MongoDB connection string

### 3. **Railway Configuration Files**
- ✅ `railway.toml` - Railway deployment config
- ✅ `nixpacks.toml` - Alternative build config
- ✅ `package.json` - Proper start script

### 4. **Common Issues & Solutions**

#### **Port Issues**
- Server uses PORT=8080 (Railway default)
- Binds to 0.0.0.0 (not localhost)

#### **SIGTERM Errors**
- Added graceful shutdown handling
- Trust proxy configuration for Railway

#### **Build Failures**
- Check Railway build logs
- Ensure all dependencies in package.json
- No devDependencies in production

### 5. **Deployment Steps**

1. **Push Code**: 
   ```bash
   git push origin main
   ```

2. **Railway Auto-Deploy**: 
   - Railway detects changes
   - Builds and deploys automatically

3. **Check Logs**: 
   - Railway Dashboard > Deployments > View Logs

4. **Test Health Check**:
   ```bash
   curl https://your-railway-domain.up.railway.app/
   ```

### 6. **Debug Commands**

```bash
# Check if server is responding
curl https://your-railway-domain.up.railway.app/api/health

# Test MongoDB connection
curl https://your-railway-domain.up.railway.app/api/health
```

### 7. **Expected Startup Logs**
```
SHRM Counseling Server running on port 8080
Environment: production
MongoDB URI configured: Yes
Email configured: Yes
Server URL: http://0.0.0.0:8080
MongoDB connected successfully
```

## 🚀 Next Steps
1. Set environment variables in Railway dashboard
2. Connect MongoDB service (or use existing URI)
3. Deploy and check logs
4. Test API endpoints
5. Update CLIENT_URL with actual Netlify domain