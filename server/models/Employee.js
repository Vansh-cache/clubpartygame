import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: 'NA',
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Employee', employeeSchema);

