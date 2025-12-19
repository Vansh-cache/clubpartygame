import express from 'express';
import mongoose from 'mongoose';
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

// Get all questions
router.get('/', async (req, res) => {
  try {
    if (!checkMongoConnection(res)) return;
    
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get active question
router.get('/active', async (req, res) => {
  try {
    if (!checkMongoConnection(res)) return;
    // Check for scheduled questions that should now be active
    const now = new Date();
    const scheduledToActivate = await Question.find({
      scheduledAt: { $lte: now },
      isActive: false
    });
    
    for (const q of scheduledToActivate) {
      await Question.findByIdAndUpdate(q._id, {
        isActive: true,
        scheduledAt: null,
        activatedAt: now
      });
    }
    
    const question = await Question.findOne({ isActive: true });
    
    // If no active question, check for scheduled question
    if (!question) {
      const scheduledQuestion = await Question.findOne({ 
        scheduledAt: { $exists: true, $ne: null } 
      }).sort({ scheduledAt: 1 });
      
      if (scheduledQuestion) {
        return res.json({
          ...scheduledQuestion.toObject(),
          isScheduled: true,
          scheduledAt: scheduledQuestion.scheduledAt,
        });
      }
    }
    
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get question by ID
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create question
router.post('/', async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update question
router.put('/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Set question as active (and deactivate others)
router.post('/:id/activate', async (req, res) => {
  try {
    const { timeGapMinutes } = req.body; // Time gap in minutes
    
    // Deactivate all questions first
    await Question.updateMany({}, { isActive: false, scheduledAt: null, activatedAt: null });
    
    let updateData = {};
    
    if (timeGapMinutes && timeGapMinutes > 0) {
      // Schedule the question to activate after time gap
      const scheduledAt = new Date(Date.now() + timeGapMinutes * 60 * 1000);
      updateData = { scheduledAt, isActive: false, activatedAt: null };
    } else {
      // Activate immediately
      updateData = { isActive: true, scheduledAt: null, activatedAt: new Date() };
    }
    
    // Update the selected question
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete question (mark as completed)
router.post('/:id/complete', async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { isActive: false, isCompleted: true },
      { new: true }
    );
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    console.log(`✅ Question marked as completed: ${question.text}`);
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deactivate question (alias for complete)
router.post('/:id/deactivate', async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { isActive: false, isCompleted: true },
      { new: true }
    );
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset all questions (for starting fresh)
router.post('/reset-all', async (req, res) => {
  try {
    await Question.updateMany(
      {},
      { isActive: false, isCompleted: false, scheduledAt: null, activatedAt: null }
    );
    res.json({ message: 'All questions reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete question
router.delete('/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

