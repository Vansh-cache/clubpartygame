# Party Game App

A real-time party game application with admin panel for managing questions, employees, and votes.

## Features

- 🎮 Interactive party game with live voting
- 👥 Employee management via Excel upload
- ❓ Question management with admin panel
- 📊 Real-time vote tracking and results
- 🎲 Lucky draw functionality
- 🗄️ MongoDB backend for data persistence

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or pnpm

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. MongoDB Setup

#### Option A: Local MongoDB

1. Install MongoDB locally or use Docker:
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo
   ```

2. MongoDB will run on `mongodb://localhost:27017`

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get your connection string
3. Update the `MONGODB_URI` in `.env` file

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/party-game

# Server Port
PORT=5000

# Frontend API URL (optional, defaults to http://localhost:5000/api)
VITE_API_URL=http://localhost:5000/api
```

For MongoDB Atlas, use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/party-game
```

### 4. Start the Application

#### Development Mode (Frontend + Backend)

Run both frontend and backend concurrently:
```bash
npm run dev:all
```

#### Run Separately

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173 (or your Vite port)
- Backend API: http://localhost:5000

## Usage

### Admin Panel

1. Access the admin panel by navigating to: `http://localhost:5173?admin=true`

2. **Upload Employees:**
   - Click on "Upload Employee List" in the Questions tab
   - Upload an Excel file (.xlsx or .xls) with employee names in the first column
   - The system will automatically parse and save employees to MongoDB

3. **Manage Questions:**
   - Add new questions with custom duration
   - Click "Go Live" to activate a question
   - Delete questions as needed

4. **Monitor:**
   - View live vote counts
   - Check question status
   - Show results for completed questions

### Excel File Format

Create an Excel file with employee names in the first column:

| Name          |
|---------------|
| John Doe      |
| Jane Smith    |
| Bob Johnson   |

Save as `.xlsx` or `.xls` format.

## API Endpoints

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `POST /api/employees/bulk` - Bulk create employees
- `DELETE /api/employees/:id` - Delete employee

### Questions
- `GET /api/questions` - Get all questions
- `GET /api/questions/active` - Get active question
- `POST /api/questions` - Create question
- `PUT /api/questions/:id` - Update question
- `POST /api/questions/:id/activate` - Activate question
- `DELETE /api/questions/:id` - Delete question

### Votes
- `GET /api/votes` - Get all votes
- `GET /api/votes/question/:questionId` - Get votes for question
- `POST /api/votes` - Submit vote
- `GET /api/votes/results/:questionId` - Get results for question

### Upload
- `POST /api/upload/excel` - Upload Excel file with employees

## Project Structure

```
.
├── server/                 # Backend server
│   ├── models/            # MongoDB models
│   │   ├── Employee.js
│   │   ├── Question.js
│   │   └── Vote.js
│   ├── routes/            # API routes
│   │   ├── employees.js
│   │   ├── questions.js
│   │   ├── votes.js
│   │   └── upload.js
│   └── index.js           # Server entry point
├── src/                   # Frontend React app
│   ├── app/
│   │   ├── components/
│   │   │   ├── AdminPanel.tsx
│   │   │   └── ...
│   │   └── App.tsx
│   └── main.tsx
└── package.json
```

## Technologies Used

### Backend
- Express.js - Web framework
- MongoDB + Mongoose - Database
- Multer - File upload handling
- XLSX - Excel file parsing
- CORS - Cross-origin resource sharing

### Frontend
- React + TypeScript
- Vite - Build tool
- Axios - HTTP client
- Tailwind CSS - Styling
- Motion - Animations

## Troubleshooting

### MongoDB Connection Issues

1. Ensure MongoDB is running:
   ```bash
   # Check MongoDB status
   mongosh --eval "db.adminCommand('ping')"
   ```

2. Verify connection string in `.env` file

3. Check firewall settings if using MongoDB Atlas

### Port Already in Use

If port 5000 is in use, change it in `.env`:
```env
PORT=5001
```

### Excel Upload Fails

- Ensure the file is in `.xlsx` or `.xls` format
- Check that employee names are in the first column
- Verify file size is under 10MB

## License

Private project
