import express from 'express';
import mongoose from 'mongoose';
import Winner from '../models/Winner.js';
import Question from '../models/Question.js';

const router = express.Router();

// Helper function to check MongoDB connection
const checkMongoConnection = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ 
      error: 'Database not connected',
      message: 'MongoDB connection is not available. Please check your database connection.'
    });
    return false;
  }
  return true;
};

// Get all winners
router.get('/', async (req, res) => {
  try {
    if (!checkMongoConnection(res)) return;
    
    const winners = await Winner.find().sort({ createdAt: -1 });
    res.json(winners);
  } catch (error) {
    console.error('Error fetching winners:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get winner for a specific question
router.get('/question/:questionId', async (req, res) => {
  try {
    const winner = await Winner.findOne({ questionId: req.params.questionId });
    if (!winner) {
      return res.status(404).json({ error: 'Winner not found for this question' });
    }
    res.json(winner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save or update winner for a question
router.post('/', async (req, res) => {
  try {
    const { questionId, questionText, winner, voteCount, totalVotes } = req.body;
    
    if (!questionId || !questionText || !winner || voteCount === undefined) {
      return res.status(400).json({ error: 'questionId, questionText, winner, and voteCount are required' });
    }
    
    // Check if winner already exists for this question
    const existingWinner = await Winner.findOne({ questionId });
    
    if (existingWinner) {
      // Update existing winner
      existingWinner.winner = winner;
      existingWinner.voteCount = voteCount;
      existingWinner.totalVotes = totalVotes || 0;
      existingWinner.questionText = questionText;
      await existingWinner.save();
      res.json(existingWinner);
    } else {
      // Create new winner
      const newWinner = new Winner({
        questionId,
        questionText,
        winner,
        voteCount,
        totalVotes: totalVotes || 0,
      });
      await newWinner.save();
      res.status(201).json(newWinner);
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Winner already exists for this question' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Delete winner for a question
router.delete('/question/:questionId', async (req, res) => {
  try {
    const winner = await Winner.findOneAndDelete({ questionId: req.params.questionId });
    if (!winner) {
      return res.status(404).json({ error: 'Winner not found' });
    }
    res.json({ message: 'Winner deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all winners
router.delete('/all', async (req, res) => {
  try {
    const result = await Winner.deleteMany({});
    res.json({ message: `All winners deleted successfully`, deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

