# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Setup MongoDB

### Local MongoDB

1. **Option A: Using Docker (Recommended)**
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo
   ```

2. **Option B: Install MongoDB locally**
   - Download from: https://www.mongodb.com/try/download/community
   - Follow installation instructions for your OS
   - Start MongoDB service

### MongoDB Atlas (Cloud - Free)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier)
4. Get your connection string
5. Update `.env` file with your connection string

## Step 3: Configure Environment

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/party-game
PORT=5000
```

For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/party-game
PORT=5000
```

## Step 4: Start the Application

### Option A: Run Both Frontend and Backend

```bash
npm run dev:all
```

### Option B: Run Separately

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

## Step 5: Access the Application

- Frontend: http://localhost:5173
- Admin Panel: http://localhost:5173?admin=true
- Backend API: http://localhost:5000/api

## Excel File Format

Create an Excel file with employee names:

| Name          |
|---------------|
| John Doe      |
| Jane Smith    |
| Bob Johnson   |

**Important:**
- Employee names should be in the first column
- First row can be a header (will be skipped)
- Save as `.xlsx` or `.xls`

## Testing the Upload

1. Go to Admin Panel: http://localhost:5173?admin=true
2. Click on "Questions" tab
3. Click "Upload Employee List"
4. Select your Excel file
5. Employees will be saved to MongoDB

## Troubleshooting

### "Cannot connect to MongoDB"
- Check if MongoDB is running: `mongosh --eval "db.adminCommand('ping')"`
- Verify connection string in `.env`
- For Atlas: Check IP whitelist in MongoDB Atlas dashboard

### "Port 5000 already in use"
- Change PORT in `.env` file
- Or kill the process using port 5000

### Excel upload fails
- Ensure file format is `.xlsx` or `.xls`
- Check file size (max 10MB)
- Verify names are in first column

