import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 10,
    max: 120,
    default: 30,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'both'],
    default: 'both',
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  scheduledAt: {
    type: Date,
    default: null,
  },
  activatedAt: {
    type: Date,
    default: null,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Question', questionSchema);

