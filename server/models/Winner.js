import mongoose from 'mongoose';

const winnerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  winner: {
    type: String,
    required: true,
  },
  voteCount: {
    type: Number,
    required: true,
    default: 0,
  },
  totalVotes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index to ensure one winner per question
winnerSchema.index({ questionId: 1 }, { unique: true });

export default mongoose.model('Winner', winnerSchema);

