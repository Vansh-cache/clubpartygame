import express from 'express';
import mongoose from 'mongoose';
import Vote from '../models/Vote.js';

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

// Get all votes
router.get('/', async (req, res) => {
  try {
    if (!checkMongoConnection(res)) return;
    
    const votes = await Vote.find().populate('questionId').sort({ createdAt: -1 });
    res.json(votes);
  } catch (error) {
    console.error('Error fetching votes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get votes for a specific question
router.get('/question/:questionId', async (req, res) => {
  try {
    if (!checkMongoConnection(res)) return;
    const votes = await Vote.find({ questionId: req.params.questionId });
    
    // Calculate vote counts (case-insensitive)
    const voteCounts = {};
    const nameMap = {}; // Map lowercase to original case (use first occurrence)
    
    votes.forEach(vote => {
      const personName = vote.votedFor.trim();
      const personNameLower = personName.toLowerCase();
      
      // Store original case if not seen before
      if (!nameMap[personNameLower]) {
        nameMap[personNameLower] = personName;
      }
      
      // Count votes (case-insensitive)
      voteCounts[personNameLower] = (voteCounts[personNameLower] || 0) + 1;
    });
    
    // Convert voteCounts to use original case for display
    const voteCountsWithOriginalCase = {};
    Object.entries(voteCounts).forEach(([lowerName, count]) => {
      voteCountsWithOriginalCase[nameMap[lowerName]] = count;
    });
    
    res.json({
      votes,
      voteCounts: voteCountsWithOriginalCase,
      totalVotes: votes.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit a vote
router.post('/', async (req, res) => {
  try {
    const { questionId, voterName, votedFor } = req.body;
    
    if (!questionId || !voterName || !votedFor) {
      return res.status(400).json({ error: 'questionId, voterName, and votedFor are required' });
    }
    
    const vote = new Vote({
      questionId,
      voterName,
      votedFor,
    });
    
    await vote.save();
    res.status(201).json(vote);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already voted for this question' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Get results for a question (aggregated)
router.get('/results/:questionId', async (req, res) => {
  try {
    const votes = await Vote.find({ questionId: req.params.questionId });
    
    // Calculate vote counts for each person (case-insensitive)
    const voteCounts = {};
    const nameMap = {}; // Map lowercase to original case (use first occurrence)
    
    votes.forEach(vote => {
      const personName = vote.votedFor.trim();
      const personNameLower = personName.toLowerCase();
      
      // Store original case if not seen before
      if (!nameMap[personNameLower]) {
        nameMap[personNameLower] = personName;
      }
      
      // Count votes (case-insensitive)
      voteCounts[personNameLower] = (voteCounts[personNameLower] || 0) + 1;
    });
    
    // Convert voteCounts to use original case for display
    const voteCountsWithOriginalCase = {};
    Object.entries(voteCounts).forEach(([lowerName, count]) => {
      voteCountsWithOriginalCase[nameMap[lowerName]] = count;
    });
    
    // Find the single winner (person with maximum votes)
    let winner = null;
    let maxVotes = 0;
    let winnerKey = null;
    
    Object.entries(voteCounts).forEach(([lowerName, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        winnerKey = lowerName;
      }
    });
    
    // Use original case for winner
    if (winnerKey) {
      winner = nameMap[winnerKey];
    }
    
    res.json({
      questionId: req.params.questionId,
      voteCounts: voteCountsWithOriginalCase,
      winner,
      winnerVoteCount: maxVotes,
      totalVotes: votes.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all votes for a question
router.delete('/question/:questionId', async (req, res) => {
  try {
    await Vote.deleteMany({ questionId: req.params.questionId });
    res.json({ message: 'Votes deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all votes
router.delete('/all', async (req, res) => {
  try {
    const result = await Vote.deleteMany({});
    res.json({ message: `All votes deleted successfully`, deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

