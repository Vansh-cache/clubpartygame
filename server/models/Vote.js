import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  voterName: {
    type: String,
    required: true,
  },
  votedFor: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index to prevent duplicate votes from same user for same question
voteSchema.index({ questionId: 1, voterName: 1 }, { unique: true });

export default mongoose.model('Vote', voteSchema);

