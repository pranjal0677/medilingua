// routes/medicalRoutes.js
import express from 'express';
import { termController } from '../controllers/termController.js';

const router = express.Router();

router.post('/simplify-term', termController.simplifyTerm);
router.get('/popular-terms', termController.getPopularTerms);
router.get('/recent-terms', termController.getRecentTerms);

export default router;