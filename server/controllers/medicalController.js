// server/controllers/medicalController.js
import groqService from '../services/groqService.js';

export const medicalController = {
  async simplifyTerm(req, res) {
    try {
      const { term } = req.body;
      if (!term) {
        return res.status(400).json({ error: 'Term is required' });
      }

      const result = await groqService.simplifyMedicalTerm(term);
      res.json(result);
    } catch (error) {
      console.error('Controller Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async analyzeReport(req, res) {
    try {
      const { reportText } = req.body;
      if (!reportText) {
        return res.status(400).json({ error: 'Report text is required' });
      }

      const result = await groqService.analyzeReport(reportText);
      res.json(result);
    } catch (error) {
      console.error('Controller Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};