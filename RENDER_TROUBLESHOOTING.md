# 🔧 Render Deployment Troubleshooting Guide

## ✅ Fixes Applied

I've updated `server/index.js` with the following fixes:

1. **Server now binds to `0.0.0.0`** (required for Render)
2. **Simplified CORS configuration** (accepts all origins)
3. **Increased MongoDB timeouts** (30 seconds for cloud deployments)
4. **Added root endpoint** (`/`) for easy health checks

---

## 🚀 Deploy to Render - Step by Step

### Step 1: Check Your Settings

Go to your Render dashboard and verify:

| Setting | Correct Value |
|---------|---------------|
| **Root Directory** | `server` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Branch** | `main` |

### Step 2: Environment Variables

Make sure you have added:

| Variable | Example Value | Required |
|----------|---------------|----------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/party-game` | ✅ YES |
| `NODE_ENV` | `production` | ⚠️ Recommended |

**How to add:**
1. Go to your Render service
2. Click **"Environment"** in left sidebar
3. Click **"Add Environment Variable"**
4. Add key and value
5. Click **"Save Changes"**

### Step 3: Check MongoDB Atlas

Your MongoDB needs to allow Render to connect:

1. Go to https://cloud.mongodb.com
2. Click **"Network Access"** (left sidebar)
3. Click **"Add IP Address"**
4. Click **"Allow Access from Anywhere"**
5. Enter: `0.0.0.0/0`
6. Click **"Confirm"**

### Step 4: Verify Connection String

Your `MONGODB_URI` should look like:
```
mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/party-game?retryWrites=true&w=majority
```

**Common mistakes:**
- ❌ `<password>` left as placeholder
- ❌ Missing database name (`/party-game`)
- ❌ Special characters in password not URL-encoded
- ❌ Wrong username or password

### Step 5: Redeploy

1. Push your latest code to GitHub:
   ```bash
   git add .
   git commit -m "Fix Render deployment"
   git push origin main
   ```

2. In Render dashboard:
   - Click **"Manual Deploy"**
   - Select **"Clear build cache & deploy"**
   - Click **"Deploy"**

---

## 📋 Check Deployment Logs

### How to View Logs

1. Go to your Render service
2. Click **"Logs"** tab
3. Watch for these messages:

**✅ Good signs:**
```
🔄 Attempting to connect to MongoDB...
✅ Connected to MongoDB successfully
🚀 Server running on http://0.0.0.0:10000
```

**❌ Bad signs and fixes:**

| Error Message | Solution |
|---------------|----------|
| `MongooseServerSelectionError` | Check MongoDB Atlas IP whitelist |
| `Authentication failed` | Verify username/password in connection string |
| `EADDRINUSE` | Port conflict (shouldn't happen on Render) |
| `Cannot find module` | Clear build cache and redeploy |
| `connect ETIMEDOUT` | MongoDB Atlas not accessible |

---

## 🧪 Test Your Deployment

Once deployed, test these endpoints:

### 1. Root Endpoint
```bash
curl https://your-backend.onrender.com/
```

**Expected response:**
```json
{
  "message": "Party Game API Server",
  "status": "running",
  "endpoints": { ... }
}
```

### 2. Health Check
```bash
curl https://your-backend.onrender.com/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "message": "Server is running",
  "mongoConnected": true,
  "mongoState": "connected"
}
```

### 3. Get Employees
```bash
curl https://your-backend.onrender.com/api/employees
```

**Expected response:**
```json
[]
```
(Empty array if no employees uploaded yet)

---

## ⏱️ Deployment Timeline

Normal Render deployment takes:

| Phase | Duration | What's Happening |
|-------|----------|------------------|
| **Build** | 2-5 min | Installing dependencies |
| **Deploy** | 1-2 min | Starting server |
| **Total** | 3-7 min | Complete deployment |

**If it takes longer than 10 minutes:**
- Check logs for errors
- Cancel and redeploy
- Clear build cache

---

## 🔴 Common Render Issues

### Issue 1: "Application failed to respond"

**Cause:** Server not binding to correct port or host

**Fix:** ✅ Already fixed! Server now binds to `0.0.0.0`

**Verify in logs:**
```
🚀 Server running on http://0.0.0.0:10000
```

### Issue 2: Build succeeds but deploy fails

**Possible causes:**
1. MongoDB connection string missing
2. MongoDB Atlas IP not whitelisted
3. Server crashing on startup

**Fix:**
1. Add `MONGODB_URI` environment variable
2. Check MongoDB Atlas Network Access
3. Check logs for crash errors

### Issue 3: "Port already in use"

**Cause:** Render assigns port dynamically

**Fix:** ✅ Already handled! Code uses `process.env.PORT`

### Issue 4: Stuck on "Building..."

**Causes:**
- Large `node_modules` folder
- Network issues
- Render service issues

**Fixes:**
1. Wait 10-15 minutes
2. Cancel and restart deployment
3. Clear build cache:
   - Settings → Build & Deploy
   - Click "Clear build cache"
   - Redeploy

### Issue 5: Deploy works but health check fails

**Cause:** MongoDB not connecting

**Check:**
1. Logs show MongoDB connection error?
2. MongoDB Atlas IP whitelist includes `0.0.0.0/0`?
3. Connection string correct?

**Fix:**
```bash
# Test MongoDB connection string locally first
node -e "
  import('mongoose').then(mongoose => {
    mongoose.connect('YOUR_MONGODB_URI')
      .then(() => { console.log('✅ Connected!'); process.exit(0); })
      .catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
  });
"
```

---

## 🔍 Debug Checklist

Before asking for help, verify:

- [ ] Root Directory is set to `server`
- [ ] Build Command is `npm install`
- [ ] Start Command is `npm start`
- [ ] `MONGODB_URI` environment variable is set
- [ ] MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- [ ] MongoDB username/password are correct
- [ ] Latest code is pushed to GitHub
- [ ] Render is deploying from correct branch (`main`)
- [ ] Build logs show no errors
- [ ] Server logs show "Server running on..."

---

## 💡 Pro Tips

### 1. Use Render's "Manual Deploy"
- Gives you more control
- Can clear build cache
- Can deploy specific commits

### 2. Check Service Health
Render shows service health at top of dashboard:
- 🟢 **Healthy** - All good!
- 🟡 **Deploying** - Wait for it
- 🔴 **Failed** - Check logs

### 3. Monitor First Request
Render free tier sleeps after 15 minutes:
- First request after sleep: 30-60 seconds
- Keep service awake with a ping service (optional)

### 4. Use Render's Shell
Access your running service:
1. Click **"Shell"** tab
2. Run commands directly:
   ```bash
   npm list
   node -v
   echo $MONGODB_URI
   ```

---

## 📞 Still Having Issues?

### Quick Fixes to Try:

1. **Clear Build Cache & Redeploy**
   ```
   Render Dashboard → Manual Deploy → 
   Clear build cache & deploy
   ```

2. **Delete and Recreate Service**
   - Sometimes Render has cache issues
   - Create a new service with same settings

3. **Check Render Status**
   - Visit: https://status.render.com
   - Check for ongoing incidents

4. **Try Different Region**
   - Some regions have better MongoDB connectivity
   - Oregon (US West) or Frankfurt (EU) often work well

---

## ✅ Success Indicators

Your deployment is successful when you see:

**In Logs:**
```
==> Building...
==> Installing dependencies
==> Starting server
🔄 Attempting to connect to MongoDB...
✅ Connected to MongoDB successfully
✅ MongoDB connected
🚀 Server running on http://0.0.0.0:10000
📍 Environment: production
```

**In Browser:**
- `https://your-backend.onrender.com/` shows API info
- `https://your-backend.onrender.com/api/health` shows status
- Render dashboard shows 🟢 **Healthy**

---

## 🎉 Next Steps After Successful Deploy

1. **Copy your Render URL**
   - Example: `https://party-game-backend.onrender.com`

2. **Update Vercel environment variable:**
   - Go to Vercel dashboard
   - Your project → Settings → Environment Variables
   - Update `VITE_API_URL` to: `https://your-backend.onrender.com/api`

3. **Redeploy Vercel:**
   - Vercel dashboard → Deployments
   - Click "Redeploy"

4. **Test the full app!**
   - Visit your Vercel URL
   - Check admin panel
   - Check live display

---

## 🆘 Emergency Contact

If nothing works:

1. **Export your MongoDB data** (just in case)
2. **Try Render alternatives:**
   - Railway.app (similar to Render)
   - Heroku (has free tier)
   - Fly.io (free tier available)

3. **Join Render community:**
   - https://community.render.com
   - Very responsive support

---

**Remember:** Render free tier can take 1-2 minutes to wake up from sleep. Be patient! ☕

