import express from 'express';
import User from '../models/User.js';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

const router = express.Router();

// Get user's history
router.get('/', async (req, res) => {
  try {
    const { userId } = req.auth;
    console.log('Getting history for user:', userId);

    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Sort history by timestamp in descending order
    const sortedHistory = user.history.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Map history items to ensure consistent structure
    const processedHistory = sortedHistory.map(item => ({
      type: item.type,
      original: item.original,
      simplified: item.simplified,
      timestamp: item.timestamp
    }));

    console.log('Sending processed history:', {
      totalItems: processedHistory.length,
      terms: processedHistory.filter(item => item.type === 'term').length,
      reports: processedHistory.filter(item => item.type === 'report').length
    });

    res.json(processedHistory);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add simplified term to history
router.post('/terms', async (req, res) => {
  try {
    const { userId } = req.auth;
    const { term, simplifiedTerm } = req.body;
    console.log('Adding term to history:', { userId, term, simplifiedTerm });

    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      user = new User({
        clerkId: userId,
        email: req.auth.email || 'unknown',
        history: []
      });
    }

    user.history.push({
      type: 'term',
      original: term,
      simplified: simplifiedTerm
    });

    await user.save();
    console.log('Term added to history successfully');
    res.json({ message: 'Term added to history' });
  } catch (error) {
    console.warn('Add term error:', error);
    res.status(500).json({ error: 'Failed to add term to history' });
  }
});

// Add analyzed report to history
router.post('/reports', async (req, res) => {
  try {
    const { userId } = req.auth;
    const { report, analysis } = req.body;
    console.log('Adding report to history:', { userId });

    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      user = new User({
        clerkId: userId,
        email: req.auth.email || 'unknown',
        history: []
      });
    }

    // Convert analysis to string format for storage
    const simplifiedAnalysis = JSON.stringify({
      summary: analysis.summary,
      keyPoints: analysis.keyPoints,
      medicalTerms: analysis.medicalTerms,
      actions: analysis.actions,
      warnings: analysis.warnings
    });

    user.history.push({
      type: 'report',
      original: report,
      simplified: simplifiedAnalysis // Store the stringified analysis
    });

    await user.save();
    console.log('Report added to history successfully');
    res.json({ message: 'Report added to history' });
  } catch (error) {
    console.warn('Add report error:', error);
    res.status(500).json({ error: 'Failed to add report to history' });
  }
});

// Delete routes
router.delete('/:entryId', async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.auth.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const entryId = req.params.entryId;
    user.history = user.history.filter(entry => entry._id.toString() !== entryId);
    await user.save();

    res.json({ message: 'History entry deleted successfully' });
  } catch (error) {
    console.error('Delete history entry error:', error);
    res.status(500).json({ message: 'Failed to delete history entry' });
  }
});

router.delete('/', async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.auth.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.history = [];
    await user.save();

    res.json({ message: 'History cleared successfully' });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ message: 'Failed to clear history' });
  }
});

export default router;