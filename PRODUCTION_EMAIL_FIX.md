# Production Contact Form Error - Railway Environment Variables Fix

## 🚨 **Issue**: Contact form works locally but fails in production

**Error**: "Sorry, there was an error sending your message. Please try again or call us directly at (555) 123-4567."

## 🔍 **Root Cause**: Missing Environment Variables in Railway

Your local `.env` file has email configuration, but Railway production environment is missing these variables.

## ✅ **Solution**: Set Environment Variables in Railway Dashboard

### **Step 1: Go to Railway Dashboard**
1. Open [Railway Dashboard](https://railway.app/dashboard)
2. Select your SHRM server project
3. Go to **Variables** tab

### **Step 2: Add Required Environment Variables**

Copy these **EXACT** values to Railway Variables:

```bash
# Core Settings
NODE_ENV=production
PORT=8080

# Email Configuration (CRITICAL - these are missing!)
EMAIL_HOST=webhosting2023.is.cc
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=info@safehavenrestorationministries.com
EMAIL_PASS=Safehaven2025
CONTACT_EMAIL=info@safehavenrestorationministries.com
ADMIN_EMAIL=info@safehavenrestorationministries.com

# Security
JWT_SECRET=shrm_production_jwt_secret_key_2024_very_secure
JWT_EXPIRE=30d
BCRYPT_ROUNDS=12

# Frontend URL (update with actual Netlify domain)
CLIENT_URL=https://your-netlify-domain.netlify.app

# Optional
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
MAX_FILE_SIZE=10000000
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

### **Step 3: MongoDB Connection**
Railway should auto-provide `MONGODB_URI` if you have MongoDB service connected.
If not, add: `MONGODB_URI=your-mongodb-connection-string`

## 🔧 **Verification Steps**

### **1. Check Railway Deployment Logs**
After adding variables:
1. Railway will auto-redeploy
2. Check logs for: "Email configured: Yes"
3. Look for startup message: "SHRM Counseling Server running on port 8080"

### **2. Test API Endpoints**
```bash
# Test server health
curl https://your-railway-domain.up.railway.app/

# Test contact endpoint (should not return 500 error)
curl -X POST https://your-railway-domain.up.railway.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","subject":"Test","message":"Test"}'
```

### **3. Frontend API URL**
Ensure your frontend is pointing to the correct Railway URL:
- Check `.env.production` in client folder
- Update `REACT_APP_API_URL` if needed

## 🚨 **Common Issues**

### **Missing EMAIL_PASS**
- **Error**: SMTP authentication failure
- **Fix**: Ensure `EMAIL_PASS=Safehaven2025` is set in Railway

### **Wrong EMAIL_PORT**
- **Error**: Connection timeout
- **Fix**: Ensure `EMAIL_PORT=587` (not 465)

### **Missing EMAIL_HOST**
- **Error**: Cannot resolve hostname
- **Fix**: Ensure `EMAIL_HOST=webhosting2023.is.cc`

### **Wrong CLIENT_URL**
- **Error**: CORS issues
- **Fix**: Update `CLIENT_URL` to your actual Netlify domain

## 📝 **Expected Behavior After Fix**

1. **Railway logs show**: "Email configured: Yes"
2. **Contact form submits** without errors
3. **Admin receives email** at info@safehavenrestorationministries.com
4. **User receives confirmation** email

## 🎯 **Next Steps**

1. Add all environment variables to Railway
2. Wait for auto-deployment (2-3 minutes)
3. Test contact form on production site
4. Check Railway logs if still failing

**Priority**: This is the most likely cause of your production contact form failure.