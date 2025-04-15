// server/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import authRoutes from './routes/authRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import mongoose from 'mongoose';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

// Load environment variables
dotenv.config();

// Verify required environment variables
if (!process.env.CLERK_SECRET_KEY) {
  console.error('CLERK_SECRET_KEY is required but not set in environment variables');
  process.exit(1);
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  family: 4 // Use IPv4, skip IPv6
})
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    // Don't exit process in production to allow serverless function to continue
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });

// MongoDB Connection Events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

const app = express();

// CORS configuration
app.use(cors({
  origin: '*',  // Allow all origins temporarily
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    headers: req.headers
  });
  next();
});

// Protected routes
app.use('/api/history', async (req, res, next) => {
  try {
    // Wrap the Clerk authentication middleware in a try-catch
    await ClerkExpressRequireAuth()(req, res, (err) => {
      if (err) {
        console.error('Clerk authentication error:', err);
        return res.status(401).json({ error: 'Authentication failed', details: err.message });
      }
      next();
    });
  } catch (error) {
    console.error('Error in Clerk authentication wrapper:', error);
    res.status(401).json({ error: 'Authentication failed', details: error.message });
  }
}, historyRoutes);

// Groq API function
async function callGroqAPI(messages) {
  try {
    console.log('Calling Groq API with messages:', messages);
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: "llama3-70b-8192", // Using the correct model name
      messages,
      temperature: 0.3,
      max_tokens: 2048
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Groq API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    if (error.response?.status === 400) {
      throw new Error('Invalid request to Groq API. Please check the model and parameters.');
    } else if (error.response?.status === 401) {
      throw new Error('Unauthorized access to Groq API. Please check your API key.');
    } else if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded for Groq API. Please try again later.');
    } else if (error.response?.status === 404) {
      throw new Error('Model not found. Please check the model name is correct.');
    }
    throw error;
  }
}

// Term simplification endpoint
app.post('/api/simplify-term', async (req, res, next) => {
  try {
    await ClerkExpressRequireAuth()(req, res, (err) => {
      if (err) {
        console.error('Clerk authentication error:', err);
        return res.status(401).json({ error: 'Authentication failed', details: err.message });
      }
      next();
    });
  } catch (error) {
    console.error('Error in Clerk authentication wrapper:', error);
    res.status(401).json({ error: 'Authentication failed', details: error.message });
  }
}, async (req, res) => {
  try {
    const { term } = req.body;
    console.log('Received term:', term);
    console.log('User:', req.auth);
    
    if (!term) {
      return res.status(400).json({ error: 'Term is required' });
    }

    console.log('Received term for simplification:', term);

    const messages = [
      {
        role: "system",
        content: "You are a medical expert who explains complex medical terms in simple language. You must respond with valid JSON only, no additional text or formatting."
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

    const completion = await callGroqAPI(messages);
    let result;
    try {
      const content = completion.choices[0].message.content;
      // Remove any markdown formatting if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Error parsing Groq API response:', parseError);
      console.log('Raw response content:', completion.choices[0].message.content);
      return res.status(500).json({ 
        error: 'Failed to parse API response',
        details: parseError.message
      });
    }
    
    console.log('Sending simplified term:', result);
    res.json(result);

  } catch (error) {
    console.error('Error in simplify-term:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.response?.data || error.stack
    });
  }
});

// Report analysis endpoint
app.post('/api/analyze-report', async (req, res, next) => {
  try {
    await ClerkExpressRequireAuth()(req, res, (err) => {
      if (err) {
        console.error('Clerk authentication error:', err);
        return res.status(401).json({ error: 'Authentication failed', details: err.message });
      }
      next();
    });
  } catch (error) {
    console.error('Error in Clerk authentication wrapper:', error);
    res.status(401).json({ error: 'Authentication failed', details: error.message });
  }
}, async (req, res) => {
  try {
    const { reportText } = req.body;
    console.log('Received report for analysis:', reportText);
    console.log('User:', req.auth);

    if (!reportText) {
      return res.status(400).json({ error: 'Report text is required' });
    }

    const messages = [
      {
        role: "system",
        content: "You are a medical expert who analyzes and simplifies medical reports. You must respond with valid JSON only, no additional text or formatting."
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

    const completion = await callGroqAPI(messages);
    let result;
    try {
      const content = completion.choices[0].message.content;
      // Remove any markdown formatting if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      
      // Try to find JSON content if there's any extra text
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(cleanContent);
      }
      
      console.log('Sending analyzed report:', result);
      res.json(result);
    } catch (parseError) {
      console.error('Error parsing Groq API response:', parseError);
      console.log('Raw response content:', completion.choices[0].message.content);
      
      // If parsing fails, try to extract structured data from the response
      const content = completion.choices[0].message.content;
      const fallbackResult = {
        summary: "Error parsing the full response",
        keyPoints: [],
        medicalTerms: [],
        actions: [],
        warnings: []
      };
      
      // Send the error response with the raw content for debugging
      res.status(500).json({ 
        error: 'Failed to parse API response',
        details: parseError.message,
        rawContent: content,
        fallbackResult
      });
    }
  } catch (error) {
    console.error('Error in analyze-report:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.response?.data || error.stack
    });
  }
});

app.use('/api/auth', authRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

const PORT = process.env.PORT || 5000;

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Welcome to the API');
});



