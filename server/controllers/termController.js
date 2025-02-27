// controllers/termController.js
import MedicalTerm from '../models/MedicalTerm.js';
import { callGroqAPI, formatTermPrompt } from '../services/groqService.js';

export const termController = {
  async simplifyTerm(req, res) {
    try {
      const { term } = req.body;
      if (!term) {
        return res.status(400).json({ error: 'Term is required' });
      }

      // Check if term exists in database
      let medicalTerm = await MedicalTerm.findOne({
        term: { $regex: new RegExp('^' + term + '$', 'i') }
      });

      if (medicalTerm) {
        // Update search count
        medicalTerm.searchCount += 1;
        await medicalTerm.save();
        return res.json(medicalTerm);
      }

      // If not in database, call Groq API
      const messages = formatTermPrompt(term);
      const completion = await callGroqAPI(messages);
      const result = JSON.parse(completion.choices[0].message.content);

      // Save to database
      medicalTerm = await MedicalTerm.create({
        term,
        ...result,
        searchCount: 1
      });

      res.json(medicalTerm);

    } catch (error) {
      console.error('Controller Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getPopularTerms(req, res) {
    try {
      const popularTerms = await MedicalTerm.find()
        .sort({ searchCount: -1 })
        .limit(10);
      res.json(popularTerms);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching popular terms' });
    }
  },

  async getRecentTerms(req, res) {
    try {
      const recentTerms = await MedicalTerm.find()
        .sort({ createdAt: -1 })
        .limit(10);
      res.json(recentTerms);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching recent terms' });
    }
  }
};