import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import employeeRoutes from './routes/employees.js';
import questionRoutes from './routes/questions.js';
import voteRoutes from './routes/votes.js';
import uploadRoutes from './routes/upload.js';
import winnerRoutes from './routes/winners.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/party-game';

console.log('🔄 Attempting to connect to MongoDB...');
console.log('📍 MongoDB URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide password in logs

// MongoDB connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
};

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, mongooseOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('⚠️  Server will continue to run, but database operations will fail');
    console.error('💡 Please check your MongoDB connection string in .env file');
    console.error('💡 Make sure MongoDB is running: mongod (local) or check your cloud connection string');
  });

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
  console.log('🔄 Attempting to reconnect...');
  
  // Attempt to reconnect after 5 seconds
  setTimeout(() => {
    mongoose.connect(MONGODB_URI, mongooseOptions).catch((err) => {
      console.error('❌ Reconnection failed:', err.message);
    });
  }, 5000);
});

// Handle process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/winners', winnerRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const mongoConnected = mongoose.connection.readyState === 1;
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    mongoConnected,
    mongoState: mongoose.connection.readyState === 1 ? 'connected' : 
                mongoose.connection.readyState === 2 ? 'connecting' :
                mongoose.connection.readyState === 3 ? 'disconnecting' : 'disconnected'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error(`\nTo fix this, you can:`);
    console.error(`1. Kill the process using port ${PORT}`);
    console.error(`2. Change PORT in .env file to a different port (e.g., 5001)`);
    console.error(`3. Wait a few seconds for the port to become available\n`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});

