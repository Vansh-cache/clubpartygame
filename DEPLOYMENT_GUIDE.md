# 🚀 Deployment Guide

This guide will help you deploy your Party Game application with:
- **Backend** on Render (Free tier available)
- **Frontend** on Vercel (Free tier available)

---

## 📋 Prerequisites

1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. Render account (sign up at https://render.com)
4. MongoDB Atlas account (free tier at https://www.mongodb.com/cloud/atlas)

---

## 🗄️ Step 1: Setup MongoDB Atlas (Database)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Click **"Connect"** → **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://username:<password>@cluster.mongodb.net/party-game
   ```
5. Replace `<password>` with your actual password
6. Keep this connection string - you'll need it for Render

---

## 🔧 Step 2: Push Code to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create a new repository** on GitHub

3. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

---

## 🖥️ Step 3: Deploy Backend on Render

### 3.1 Create Web Service

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your repository

### 3.2 Configure the Service

Fill in the following settings:

| Setting | Value |
|---------|-------|
| **Name** | `party-game-backend` (or any name you prefer) |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### 3.3 Add Environment Variables

Click **"Environment"** and add:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `PORT` | `5001` (optional, Render sets this automatically) |

### 3.4 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. **Copy your backend URL** (looks like: `https://party-game-backend.onrender.com`)

---

## 🌐 Step 4: Deploy Frontend on Vercel

### 4.1 Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 4.2 Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Vite` |
| **Root Directory** | `./` (leave as root) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 4.3 Add Environment Variable

Under **"Environment Variables"**, add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | Your Render backend URL + `/api` (e.g., `https://party-game-backend.onrender.com/api`) |

### 4.4 Deploy

1. Click **"Deploy"**
2. Wait for deployment (3-5 minutes)
3. You'll get a URL like: `https://your-app.vercel.app`

---

## 🔧 Step 5: Update CORS Settings

After deployment, update your backend CORS settings to allow requests from Vercel:

1. Go to your Render dashboard
2. Open your backend service
3. Go to **"Environment"**
4. Add a new variable:
   - **Key**: `ALLOWED_ORIGINS`
   - **Value**: `https://your-app.vercel.app`

5. Update `server/index.js` (if needed):
   ```javascript
   app.use(cors({
     origin: process.env.ALLOWED_ORIGINS || '*',
     credentials: true
   }));
   ```

6. **Redeploy** the backend service

---

## ✅ Step 6: Test Your Deployment

### Frontend URLs to test:
- **Main App**: `https://your-app.vercel.app`
- **Admin Panel**: `https://your-app.vercel.app/?admin=true`
- **Live Display**: `https://your-app.vercel.app/?display=live`

### Backend URLs to test:
- **Health Check**: `https://your-backend.onrender.com/api/health`
- **Get Employees**: `https://your-backend.onrender.com/api/employees`

---

## 🔄 Redeployment

### Frontend (Vercel)
- **Automatic**: Pushes to `main` branch auto-deploy
- **Manual**: Go to Vercel dashboard → Click "Redeploy"

### Backend (Render)
- **Automatic**: Pushes to `main` branch auto-deploy
- **Manual**: Go to Render dashboard → Click "Manual Deploy" → "Deploy latest commit"

---

## 🐛 Troubleshooting

### Issue: Backend shows "Application failed to respond"
**Solution**: 
- Check Render logs for errors
- Verify MongoDB connection string
- Ensure `PORT` environment variable is set

### Issue: Frontend can't connect to backend
**Solution**:
- Verify `VITE_API_URL` in Vercel environment variables
- Check CORS settings in backend
- Make sure backend URL ends with `/api`

### Issue: "Module not found" errors
**Solution**:
- Clear build cache in Vercel/Render
- Check all dependencies are in `package.json`
- Redeploy

### Issue: MongoDB connection timeout
**Solution**:
- Check MongoDB Atlas network access (allow all IPs: `0.0.0.0/0`)
- Verify username and password in connection string
- Check database user permissions

---

## 💰 Cost Estimate

| Service | Free Tier | Limitations |
|---------|-----------|-------------|
| **Vercel** | ✅ Free | 100 GB bandwidth/month |
| **Render** | ✅ Free | Sleeps after 15 min inactivity, 750 hrs/month |
| **MongoDB Atlas** | ✅ Free | 512 MB storage, shared cluster |

**Total Cost**: $0/month (with free tiers)

---

## 🚨 Important Notes

1. **Render Free Tier**: Your backend will "sleep" after 15 minutes of inactivity and take 30-60 seconds to wake up on the first request.

2. **Environment Variables**: Never commit `.env` files to GitHub. Use environment variables in Render/Vercel dashboards.

3. **MongoDB Atlas**: Add `0.0.0.0/0` to IP whitelist for Render to access it.

4. **Custom Domain**: Both Vercel and Render support custom domains (even on free tier).

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://www.mongodb.com/docs/atlas/

---

## 🎉 Success!

Your Party Game app is now live! Share your Vercel URL with users and start playing! 🎊

