// server/services/groqService.js
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

class GroqService {
  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }

  async simplifyMedicalTerm(term) {
    const prompt = `
      As a medical expert, explain the medical term "${term}" in simple language.
      Provide:
      1. A simple explanation that a layperson can understand
      2. Common examples or situations where this term applies
      3. Related medical terms that might be useful to know
      4. Any important notes or warnings if applicable

      Format the response as JSON with the following structure:
      {
        "explanation": "simple explanation here",
        "examples": ["example 1", "example 2"],
        "relatedTerms": ["term 1", "term 2"],
        "notes": "any important notes"
      }
    `;

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "mixtral-8x7b-32768",
        temperature: 0.3,
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Error in Groq API call:', error);
      throw error;
    }
  }

  async analyzeReport(reportText) {
    const prompt = `
      Analyze this medical report and provide a simplified explanation.
      Include:
      1. A simple summary of the main findings
      2. Key points that the patient should know
      3. Any medical terms explained in simple language
      4. Important actions or follow-ups needed
      5. Any warnings or precautions

      Medical Report:
      ${reportText}

      Format the response as JSON with the following structure:
      {
        "summary": "main findings in simple terms",
        "keyPoints": ["point 1", "point 2"],
        "medicalTerms": [{"term": "term1", "explanation": "simple explanation"}],
        "actions": ["action 1", "action 2"],
        "warnings": ["warning 1", "warning 2"]
      }
    `;

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "mixtral-8x7b-32768",
        temperature: 0.3,
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Error in Groq API call:', error);
      throw error;
    }
  }
}

export default new GroqService();