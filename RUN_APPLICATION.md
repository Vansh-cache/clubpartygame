# Step-by-Step Guide to Run the Application

## Prerequisites
- Node.js installed (v18 or higher)
- MongoDB (local or MongoDB Atlas cloud)

---

## Step 1: Install Dependencies

Open terminal/command prompt in the project folder and run:

```bash
npm install
```

This will install all required packages (both frontend and backend dependencies).

**Expected time:** 2-5 minutes

---

## Step 2: Setup MongoDB

You have two options:

### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a free cluster
4. Click "Connect" → "Connect your application"
5. Copy your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/party-game`)
6. Replace `<password>` with your actual password

### Option B: Local MongoDB

**Using Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

**Or install MongoDB locally:**
- Download from: https://www.mongodb.com/try/download/community
- Install and start the MongoDB service

---

## Step 3: Configure Environment Variables

1. Check if `.env` file exists in the root folder
2. If not, create a `.env` file with the following content:

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/party-game
PORT=5000
```

**For Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/party-game
PORT=5000
```

**Important:** Replace `username` and `password` with your actual MongoDB credentials.

---

## Step 4: Start the Application

### Method 1: Run Both Servers Together (Recommended)

```bash
npm run dev:all
```

This starts both frontend and backend servers simultaneously.

### Method 2: Run Servers Separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

---

## Step 5: Access the Application

Once started, you'll see output like:

```
✓ Backend running on http://localhost:5000
✓ Frontend running on http://localhost:5173
```

### Access URLs:

1. **Main Application:** http://localhost:5173
2. **Admin Panel:** http://localhost:5173?admin=true
3. **API Health Check:** http://localhost:5000/api/health

---

## Step 6: Upload Excel File (Admin Panel)

1. Open: http://localhost:5173?admin=true
2. Click on the **"Questions"** tab
3. Find the **"Upload Employee List"** section
4. Click **"Click to upload Excel file"**
5. Select your Excel file (.xlsx or .xls)
6. Wait for success message - employees will be saved to MongoDB!

### Excel File Format:

| Name          |
|---------------|
| John Doe      |
| Jane Smith    |
| Bob Johnson   |

**Requirements:**
- Employee names in the **first column**
- File format: `.xlsx` or `.xls`
- Maximum file size: 10MB

---

## Quick Command Reference

```bash
# Install dependencies
npm install

# Start both servers
npm run dev:all

# Start backend only
npm run server

# Start frontend only
npm run dev

# Build for production
npm run build
```

---

## Troubleshooting

### ❌ "Cannot connect to MongoDB"

**For MongoDB Atlas:**
- Check if your IP address is whitelisted in MongoDB Atlas dashboard
- Verify connection string in `.env` file
- Make sure password doesn't have special characters (if it does, URL encode them)

**For Local MongoDB:**
- Check if MongoDB service is running: `mongosh --eval "db.adminCommand('ping')"`
- Verify connection string: `mongodb://localhost:27017/party-game`

### ❌ "Port 5000 already in use"

**Solution 1:** Change port in `.env` file:
```env
PORT=5001
```

**Solution 2:** Kill the process using port 5000:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill
```

### ❌ "Excel upload fails"

- Ensure file is `.xlsx` or `.xls` format
- Check file size (max 10MB)
- Verify employee names are in the first column
- Check browser console for error messages

### ❌ "Module not found" or dependency errors

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Stopping the Application

Press `Ctrl + C` in the terminal where servers are running.

---

## Need Help?

- Check the full documentation in `README.md`
- Verify all steps in `SETUP.md`
- Check MongoDB connection and .env file configuration

