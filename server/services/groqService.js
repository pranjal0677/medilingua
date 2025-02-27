// services/groqService.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const callGroqAPI = async (messages) => {
  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: "mixtral-8x7b-32768",
      messages,
      temperature: 0.3,
      max_tokens: 2048
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    throw error;
  }
};

export const formatTermPrompt = (term) => {
  return [
    {
      role: "system",
      content: "You are a medical expert who explains complex medical terms in simple language."
    },
    {
      role: "user",
      content: `Explain the medical term "${term}" in simple language. 
      Format your response as JSON with these exact fields:
      {
        "explanation": "simple explanation in layman's terms",
        "examples": ["example1", "example2"],
        "relatedTerms": ["term1", "term2"],
        "notes": "important notes or warnings"
      }`
    }
  ];
};

export const formatReportPrompt = (reportText) => {
  return [
    {
      role: "system",
      content: "You are a medical expert who analyzes and simplifies medical reports."
    },
    {
      role: "user",
      content: `Analyze this medical report and provide a simplified explanation. 
      Format your response as JSON with these exact fields:
      {
        "summary": "brief summary of the report",
        "keyPoints": ["key point 1", "key point 2"],
        "medicalTerms": [
          {"term": "medical term 1", "explanation": "simple explanation 1"},
          {"term": "medical term 2", "explanation": "simple explanation 2"}
        ],
        "actions": ["action 1", "action 2"],
        "warnings": ["warning 1", "warning 2"]
      }

      Medical Report:
      ${reportText}`
    }
  ];
};