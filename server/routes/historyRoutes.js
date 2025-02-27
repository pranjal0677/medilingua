import express from 'express';
import { historyController } from '../controllers/historyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Get routes
router.get('/', historyController.getUserHistory);
router.get('/stats', historyController.getHistoryStats);
router.get('/:entryId', historyController.getHistoryEntry);

// Post routes
router.post('/term', historyController.addTermSearch);
router.post('/report', historyController.addReportAnalysis);

// Delete routes
router.delete('/:entryId', historyController.deleteHistoryEntry);
router.delete('/', historyController.clearHistory);

export default router;