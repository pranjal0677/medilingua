// server/controllers/historyController.js
import History from '../models/History.js';
import User from '../models/User.js';

export const historyController = {
  // Get user's history
  async getUserHistory(req, res) {
    try {
      const history = await History.find({ userId: req.user._id })
        .sort({ timestamp: -1 })
        .limit(50);

      res.json(history);
    } catch (error) {
      console.error('Error fetching history:', error);
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  },

  // Add term search to history
  async addTermSearch(req, res) {
    try {
      const { term, result } = req.body;
      
      // Create history entry with original term and complete response
      const historyEntry = await History.create({
        userId: req.user._id,
        type: 'term',
        data: {
          originalTerm: term, // Original search term
          term: term,
          result: {
            explanation: result.explanation,
            examples: result.examples || [],
            relatedTerms: result.relatedTerms || [],
            notes: result.notes || ''
          },
          searchTimestamp: new Date()
        }
      });

      // Add to user's history array
      await User.findByIdAndUpdate(
        req.user._id,
        { $push: { history: historyEntry._id } }
      );

      console.log('Term search saved:', {
        term,
        userId: req.user._id,
        historyId: historyEntry._id
      });

      res.status(201).json(historyEntry);
    } catch (error) {
      console.error('Error adding term search:', error);
      res.status(500).json({ error: 'Failed to save search history' });
    }
  },

  // // Add report analysis to history
  // async addReportAnalysis(req, res) {
  //   try {
  //     const { reportText, result } = req.body;
      
  //     // Create history entry with original report and complete analysis
  //     const historyEntry = await History.create({
  //       userId: req.user._id,
  //       type: 'report',
  //       data: {
  //         originalReport: reportText, // Original report text
  //         reportText: reportText,
  //         result: {
  //           summary: result.summary,
  //           keyPoints: result.keyPoints || [],
  //           medicalTerms: result.medicalTerms || [],
  //           actions: result.actions || [],
  //           warnings: result.warnings || []
  //         },
  //         analysisTimestamp: new Date()
  //       }
  //     });

  //     // Add to user's history array
  //     await User.findByIdAndUpdate(
  //       req.user._id,
  //       { $push: { history: historyEntry._id } }
  //     );

  //     console.log('Report analysis saved:', {
  //       userId: req.user._id,
  //       historyId: historyEntry._id,
  //       reportLength: reportText.length
  //     });

  //     res.status(201).json(historyEntry);
  //   } catch (error) {
  //     console.error('Error adding report analysis:', error);
  //     res.status(500).json({ error: 'Failed to save analysis history' });
  //   }
  // },

  async addReportAnalysis(req, res) {
    try {
      const { reportText, result } = req.body;
      console.log('Received for history:', { reportText, result }); // Debug log
  
      if (!reportText || !result) {
        return res.status(400).json({ 
          error: 'Missing required data' 
        });
      }
  
      const historyEntry = await History.create({
        userId: req.user._id,
        type: 'report',
        data: {
          originalText: reportText,
          analysis: {
            summary: result.summary,
            keyPoints: result.keyPoints || [],
            medicalTerms: result.medicalTerms || [],
            actions: result.actions || [],
            warnings: result.warnings || []
          },
          timestamp: new Date()
        }
      });
  
      console.log('Saved history entry:', historyEntry); // Debug log
  
      await User.findByIdAndUpdate(
        req.user._id,
        { $push: { history: historyEntry._id } }
      );
  
      res.status(201).json(historyEntry);
    } catch (error) {
      console.error('Error saving report analysis:', error);
      res.status(500).json({ error: 'Failed to save analysis' });
    }
  },

  // Get specific history entry with full details
  async getHistoryEntry(req, res) {
    try {
      const { entryId } = req.params;
      
      const historyEntry = await History.findOne({
        _id: entryId,
        userId: req.user._id
      });

      if (!historyEntry) {
        return res.status(404).json({ error: 'History entry not found' });
      }

      // Return complete entry with original text and analysis
      res.json({
        ...historyEntry.toObject(),
        data: {
          ...historyEntry.data,
          originalContent: historyEntry.data.type === 'term' 
            ? historyEntry.data.originalTerm 
            : historyEntry.data.originalReport
        }
      });
    } catch (error) {
      console.error('Error fetching history entry:', error);
      res.status(500).json({ error: 'Failed to fetch history entry' });
    }
  },

  // Delete history entry
  async deleteHistoryEntry(req, res) {
    try {
      const { entryId } = req.params;
      
      // Verify ownership
      const historyEntry = await History.findOne({
        _id: entryId,
        userId: req.user._id
      });

      if (!historyEntry) {
        return res.status(404).json({ error: 'History entry not found' });
      }

      // Remove from history collection
      await History.findByIdAndDelete(entryId);

      // Remove from user's history array
      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { history: entryId } }
      );

      console.log('History entry deleted:', {
        userId: req.user._id,
        historyId: entryId
      });

      res.json({ message: 'History entry deleted' });
    } catch (error) {
      console.error('Error deleting history entry:', error);
      res.status(500).json({ error: 'Failed to delete history entry' });
    }
  },

  // Clear all history
  async clearHistory(req, res) {
    try {
      // Delete all history entries for user
      const deleteResult = await History.deleteMany({ userId: req.user._id });

      // Clear user's history array
      await User.findByIdAndUpdate(
        req.user._id,
        { $set: { history: [] } }
      );

      console.log('History cleared:', {
        userId: req.user._id,
        entriesDeleted: deleteResult.deletedCount
      });

      res.json({ 
        message: 'History cleared',
        entriesDeleted: deleteResult.deletedCount
      });
    } catch (error) {
      console.error('Error clearing history:', error);
      res.status(500).json({ error: 'Failed to clear history' });
    }
  },

  // Get history statistics
  async getHistoryStats(req, res) {
    try {
      const stats = await History.aggregate([
        { $match: { userId: req.user._id } },
        { $group: {
          _id: '$type',
          count: { $sum: 1 },
          lastUsed: { $max: '$timestamp' }
        }}
      ]);

      res.json(stats);
    } catch (error) {
      console.error('Error fetching history stats:', error);
      res.status(500).json({ error: 'Failed to fetch history statistics' });
    }
  }
};