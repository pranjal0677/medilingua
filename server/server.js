// server/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import authRoutes from './routes/authRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import mongoose from 'mongoose';

dotenv.config();



// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
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

app.use(cors({
  origin: 'https://medilingua.vercel.app', // Replace with your client URL
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));

// Middleware
app.use(cors());
app.use(express.json());


// server/server.js
// Add this after your middleware setup
app.use((req, res, next) => {
  console.log('Request Body:', req.body);
  next();
});

// Groq API function
async function callGroqAPI(messages) {
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
}

// Term simplification endpoint
app.post('/api/simplify-term', async (req, res) => {
  try {
    const { term } = req.body;
    if (!term) {
      return res.status(400).json({ error: 'Term is required' });
    }

    const messages = [
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

    const completion = await callGroqAPI(messages);
    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Report analysis endpoint
// app.post('/api/analyze-report', async (req, res) => {
//   try {
//     const { reportText } = req.body;
//     if (!reportText) {
//       return res.status(400).json({ error: 'Report text is required' });
//     }

//     const messages = [
//       {
//         role: "system",
//         content: "You are a medical expert who analyzes and simplifies medical reports."
//       },
//       {
//         role: "user",
//         content: `Analyze this medical report and provide a simplified explanation. 
//         Format your response as JSON with these exact fields:
//         {
//           "summary": "brief summary of the report",
//           "keyPoints": ["key point 1", "key point 2"],
//           "medicalTerms": [
//             {"term": "medical term 1", "explanation": "simple explanation 1"},
//             {"term": "medical term 2", "explanation": "simple explanation 2"}
//           ],
//           "actions": ["action 1", "action 2"],
//           "warnings": ["warning 1", "warning 2"]
//         }

//         Medical Report:
//         ${reportText}`
//       }
//     ];

//     const completion = await callGroqAPI(messages);
//     const result = JSON.parse(completion.choices[0].message.content);
//     res.json(result);

//   } catch (error) {
//     console.error('Server Error:', error);
//     res.status(500).json({ 
//       error: 'Internal server error',
//       details: error.message 
//     });
//   }
// });

app.post('/api/analyze-report', async (req, res) => {
  try {
    const { reportText } = req.body;
    if (!reportText) {
      return res.status(400).json({ error: 'Report text is required' });
    }

    const completion = await groq.chat.completions.create({
      messages: [
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
              {"term": "term1", "explanation": "explanation1"},
              {"term": "term2", "explanation": "explanation2"}
            ],
            "actions": ["action 1", "action 2"],
            "warnings": ["warning 1", "warning 2"]
          }

          Medical Report:
          ${reportText}`
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.3,
    });

    // Parse and validate the response
    const result = JSON.parse(completion.choices[0].message.content);
    
    // Ensure all required fields exist
    const validatedResult = {
      summary: result.summary || '',
      keyPoints: result.keyPoints || [],
      medicalTerms: result.medicalTerms || [],
      actions: result.actions || [],
      warnings: result.warnings || []
    };

    res.json(validatedResult);
  } catch (error) {
    console.error('Error analyzing report:', error);
    res.status(500).json({ 
      error: 'Failed to analyze report',
      details: error.message 
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);

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



