# Question Creation Error - Fix Guide

## Error Encountered

```
Failed to load resource: the server responded with a status of 400 (Bad Request)
Error adding question: AxiosError
```

---

## Fixes Applied

### 1. **Backend Route Enhanced**
**File:** `server/routes/questions.js`

**Changes:**
- Added MongoDB connection check
- Added detailed console logging
- Better error handling

```javascript
// Create question
router.post('/', async (req, res) => {
  try {
    if (!checkMongoConnection(res)) return; // ← Added
    
    console.log('Creating question with data:', req.body); // ← Added
    const question = new Question(req.body);
    await question.save();
    console.log('Question created successfully:', question); // ← Added
    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error); // ← Added
    res.status(400).json({ error: error.message });
  }
});
```

### 2. **Frontend Error Handling Improved**
**File:** `src/app/components/AdminPanel.tsx`

**Changes:**
- Enhanced error logging
- Better error messages
- Suggests checking backend server

```typescript
catch (error: any) {
  console.error('Error adding question:', error);
  console.error('Error response:', error.response); // ← Added
  console.error('Error data:', error.response?.data); // ← Added
  setUploadStatus({
    type: 'error',
    message: error.response?.data?.error || 
             error.message || 
             'Failed to add question. Check if backend server is running.', // ← Enhanced
  });
}
```

---

## How to Fix

### **STEP 1: Verify Backend is Running** ✅

Open a terminal and run:

```bash
cd server
npm start
```

You should see:
```
✓ Server is running on http://localhost:5173
✓ MongoDB connected successfully
```

**If you see errors:**
- **"MongoDB connection error"** → Check your `.env` file
- **"Port already in use"** → Stop other servers or change port
- **"Cannot find module"** → Run `npm install` first

---

### **STEP 2: Check MongoDB Connection** ✅

**File:** `server/.env`

Make sure you have:
```env
MONGODB_URI=mongodb://localhost:27017/yourdbname
# OR for MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
PORT=5173
```

**Test connection:**
```bash
# If backend logs show "MongoDB connected successfully" ✅
# You're good!

# If it shows connection error ❌
# Check:
# 1. MongoDB is running (if local)
# 2. Connection string is correct
# 3. Network allows MongoDB connection
```

---

### **STEP 3: Try Adding Question Again** ✅

1. **Go to Admin Panel** (`?admin=true`)
2. **Questions tab**
3. **Fill in question:**
   - Text: "Best Female Dress"
   - Duration: 30 seconds
   - Gender: Female Only
4. **Click "Add Question"**

---

### **STEP 4: Check Console Logs** 🔍

#### **Browser Console (F12):**
Look for:
```
Creating question with data: { text: "...", duration: 30, gender: "female" }
```

**If you see errors:**
```
Error adding question: AxiosError
Error response: { status: 400, data: { error: "..." } }
Error data: { error: "Validation failed: ..." }
```

Copy the **entire error message** and share it.

#### **Backend Console (Terminal):**
Look for:
```
Creating question with data: { text: '...', duration: 30, gender: 'female' }
✅ Question created successfully: { _id: '...', text: '...', ... }
```

**If you see errors:**
```
❌ Error creating question: [error details]
```

Copy the **entire error message**.

---

## Common Issues & Solutions

### **Issue 1: Backend Not Running** ❌

**Error:**
```
Network Error
or
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

**Solution:**
```bash
cd server
npm start
```

---

### **Issue 2: MongoDB Not Connected** ❌

**Error:**
```
Database not connected
MongoDB connection is not available
```

**Solution:**

1. **Check `.env` file:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/yourdbname
   ```

2. **Start MongoDB (if local):**
   ```bash
   # Windows
   net start MongoDB

   # Mac/Linux
   sudo systemctl start mongod
   ```

3. **Or use MongoDB Atlas** (cloud)

---

### **Issue 3: Validation Error** ❌

**Error:**
```
Validation failed: duration: Path `duration` (5) is less than minimum allowed value (10)
```

**Solution:**
Check field requirements:
- **Text:** Must not be empty
- **Duration:** Must be between 10-120 seconds
- **Gender:** Must be "male", "female", or "both" (lowercase)

---

### **Issue 4: Port Conflict** ❌

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5173
```

**Solution:**

**Option 1:** Kill the process using port 5173
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5173
kill -9 <PID>
```

**Option 2:** Change port in `server/index.js`
```javascript
const PORT = process.env.PORT || 5174; // Changed from 5173
```

---

## Testing Checklist

- [ ] Backend server is running
- [ ] MongoDB is connected
- [ ] Browser console is open (F12)
- [ ] Server console is visible
- [ ] Question text is filled
- [ ] Duration is 10-120
- [ ] Gender is selected
- [ ] Click "Add Question"
- [ ] Check both consoles for errors

---

## Debug Output Example

### **SUCCESS:**

**Browser Console:**
```
✅ Question added successfully!
```

**Server Console:**
```
Creating question with data: { text: 'Best Female Dress', duration: 30, gender: 'female' }
Question created successfully: { _id: '...', text: 'Best Female Dress', ... }
```

---

### **FAILURE:**

**Browser Console:**
```
❌ Error adding question: AxiosError
Error response: {status: 400, data: {error: "..."}}
```

**Server Console:**
```
Creating question with data: { text: 'Best Female Dress', duration: 30, gender: 'female' }
❌ Error creating question: ValidationError: ...
```

---

## Still Having Issues?

If the problem persists:

1. **Take screenshots of:**
   - Browser console (F12)
   - Server terminal output
   - The question form with data filled in

2. **Share:**
   - Full error messages from both consoles
   - Your `server/.env` file (hide passwords!)
   - What you see when you start the server

3. **Try:**
   - Restarting both frontend and backend
   - Clearing browser cache
   - Trying a different browser

---

## Quick Commands

```bash
# Start backend
cd server
npm start

# Start frontend
npm run dev

# Check if MongoDB is running
# Windows
sc query MongoDB

# Mac/Linux
systemctl status mongod

# Restart everything
# Stop servers (Ctrl+C)
cd server
npm start
# Open new terminal
npm run dev
```

---

**Next:** Try adding a question and share any error messages if it still fails!

