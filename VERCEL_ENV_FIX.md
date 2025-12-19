# Vercel Environment Variable Fix

## Error

```
Environment Variable "VITE_API_URL" references Secret "vite_api_url", which does not exist.
```

---

## Quick Fix (Option 1): Remove Secret Reference

Update `vercel.json` to set the variable directly instead of using a secret.

**Before:**
```json
"env": {
  "VITE_API_URL": "@vite_api_url"
}
```

**After:**
```json
"env": {
  "VITE_API_URL": "https://your-backend-url.onrender.com/api"
}
```

Replace `https://your-backend-url.onrender.com/api` with your actual Render backend URL.

---

## Proper Fix (Option 2): Set Environment Variable in Vercel Dashboard

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Select your project
3. Click **Settings** tab
4. Click **Environment Variables** in left sidebar

### Step 2: Add Environment Variable
1. Click **Add New**
2. **Name:** `VITE_API_URL`
3. **Value:** `https://your-backend-url.onrender.com/api`
   - Replace with your actual Render backend URL
   - Example: `https://clubpartygame.onrender.com/api`
4. **Environment:** Select all (Production, Preview, Development)
5. Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click **...** on latest deployment
3. Click **Redeploy**

---

## Alternative Fix (Option 3): Use Relative API Path

If your frontend and backend are on the same domain (proxied), you can use a relative path.

Update all files to use `/api` instead of an environment variable.

**This requires Vercel rewrites configuration** - not recommended for separate frontend/backend setup.

---

## Recommended Solution

**I recommend Option 1 (Quick Fix) for now:**

1. Update `vercel.json` with your backend URL
2. Commit and push
3. Vercel will auto-deploy

---

## How to Find Your Backend URL

Your backend URL is from Render:
1. Go to https://dashboard.render.com
2. Find your backend service
3. Copy the URL (e.g., `https://your-app.onrender.com`)
4. Add `/api` to the end

**Full URL Example:**
```
https://clubpartygame.onrender.com/api
```

---

## After Fix

Once fixed, your Vercel deployment will:
- ✅ Build successfully
- ✅ Connect to your Render backend
- ✅ Work properly in production

---

## Need Both URLs?

**Frontend (Vercel):** `https://your-app.vercel.app`
**Backend (Render):** `https://your-backend.onrender.com`

Make sure to also update CORS settings in your backend to allow requests from your Vercel domain!

