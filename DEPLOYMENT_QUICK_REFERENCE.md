# 🚀 Quick Deployment Reference

## 📦 Files Created for Deployment

✅ `server/package.json` - Backend dependencies
✅ `vercel.json` - Vercel configuration
✅ `ENV_TEMPLATE.txt` - Environment variables template
✅ `DEPLOYMENT_GUIDE.md` - Full deployment instructions

---

## 🔑 Key Changes Made

### 1. Backend CORS Configuration
Updated `server/index.js` to support production origins:
- Accepts `ALLOWED_ORIGINS` environment variable
- Example: `https://your-app.vercel.app,https://your-custom-domain.com`

### 2. Backend Package.json
Created separate `server/package.json` with:
- Only backend dependencies
- Start script for production
- Node version specification

### 3. Vercel Configuration
Created `vercel.json` with:
- Static build configuration
- Routing rules for SPA
- Environment variable placeholder

---

## ⚡ Quick Deploy Steps

### Backend (Render)
```bash
1. Create account at render.com
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - Root Directory: server
   - Build: npm install
   - Start: npm start
5. Add Environment Variable:
   - MONGODB_URI: your_mongodb_connection_string
6. Deploy!
```

### Frontend (Vercel)
```bash
1. Create account at vercel.com
2. Import GitHub repository
3. Settings:
   - Framework: Vite
   - Build: npm run build
   - Output: dist
4. Add Environment Variable:
   - VITE_API_URL: https://your-backend.onrender.com/api
5. Deploy!
```

---

## 🔧 Environment Variables

### Render (Backend)
| Variable | Example | Required |
|----------|---------|----------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/party-game` | ✅ Yes |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` | ⚠️ Recommended |
| `PORT` | `5001` | ❌ Auto-set by Render |

### Vercel (Frontend)
| Variable | Example | Required |
|----------|---------|----------|
| `VITE_API_URL` | `https://your-backend.onrender.com/api` | ✅ Yes |

---

## 📝 MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com
2. Create free cluster
3. **Database Access** → Add User (save password!)
4. **Network Access** → Add IP: `0.0.0.0/0` (allow all)
5. **Connect** → Copy connection string
6. Replace `<password>` with your actual password

---

## 🧪 Testing Your Deployment

### Test Backend
```bash
# Replace with your Render URL
curl https://your-backend.onrender.com/api/health
```

Expected response: `{"status":"ok","database":"connected"}`

### Test Frontend
Visit in browser:
- Main app: `https://your-app.vercel.app`
- Admin: `https://your-app.vercel.app/?admin=true`
- Display: `https://your-app.vercel.app/?display=live`

---

## 🔄 Update Deployment

### Push to GitHub
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Both Vercel and Render will **auto-deploy** on push to `main`!

---

## 🚨 Common Issues & Fixes

### ❌ "Failed to fetch" error in frontend
**Fix**: Check `VITE_API_URL` in Vercel environment variables
- Must end with `/api`
- Must be HTTPS
- No trailing slash after `/api`

### ❌ Backend shows "Application failed to respond"
**Fix**: Check Render logs for errors
- Verify MongoDB connection string
- Check Node version compatibility
- Ensure all dependencies are listed

### ❌ CORS error in browser console
**Fix**: Add Vercel URL to `ALLOWED_ORIGINS` in Render
- Go to Render dashboard
- Environment → Add `ALLOWED_ORIGINS`
- Value: `https://your-app.vercel.app`
- Click "Save" and wait for redeploy

### ❌ MongoDB connection timeout
**Fix**: Check MongoDB Atlas settings
- Network Access: Add `0.0.0.0/0`
- Database Access: Verify user has read/write permissions
- Connection string: Verify password is correct

---

## 💡 Pro Tips

1. **Custom Domain**: Both Vercel and Render support custom domains for free
2. **Logs**: Check Render logs for backend errors, Vercel logs for build errors
3. **Caching**: Vercel caches builds - use "Redeploy" if changes don't appear
4. **Cold Starts**: Render free tier sleeps after 15 min - first request takes 30-60s
5. **Preview Deploys**: Vercel creates preview URLs for PRs automatically

---

## 📱 URLs Format

### Development
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`
- API Base: `http://localhost:5001/api`

### Production
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`
- API Base: `https://your-backend.onrender.com/api`

---

## 🎯 Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] MongoDB connection string copied
- [ ] Code pushed to GitHub
- [ ] Render web service created
- [ ] Backend environment variables set
- [ ] Backend deployed successfully
- [ ] Vercel project created
- [ ] Frontend environment variable set
- [ ] Frontend deployed successfully
- [ ] Tested admin panel
- [ ] Tested live display
- [ ] Tested user flow
- [ ] Uploaded employee list

---

## 🎉 You're Done!

Your app is now live and accessible worldwide! 🌍

Share your Vercel URL with your team and enjoy the game! 🎊

