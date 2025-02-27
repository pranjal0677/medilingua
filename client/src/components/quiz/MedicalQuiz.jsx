// client/src/components/quiz/MedicalQuiz.jsx
import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  LinearProgress,
} from '@mui/material';
import { medicalService } from '../../services/api';

const MedicalQuiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const terms = await medicalService.getPopularTerms();
      const quizQuestions = terms.map(term => ({
        term: term.term,
        correctAnswer: term.explanation,
        options: generateOptions(term.explanation, terms)
      }));
      setQuestions(quizQuestions.slice(0, 5)); // Take 5 questions
      setLoading(false);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const generateOptions = (correct, terms) => {
    const options = [correct];
    while (options.length < 4) {
      const randomTerm = terms[Math.floor(Math.random() * terms.length)];
      if (!options.includes(randomTerm.explanation)) {
        options.push(randomTerm.explanation);
      }
    }
    return shuffleArray(options);
  };

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const handleAnswer = () => {
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
    } else {
      setShowResults(true);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (showResults) {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Quiz Results
          </Typography>
          <Typography variant="h6" color="primary">
            Score: {score} out of {questions.length}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setCurrentQuestion(0);
              setScore(0);
              setShowResults(false);
              loadQuestions();
            }}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Medical Terms Quiz
        </Typography>
        
        <LinearProgress 
          variant="determinate" 
          value={(currentQuestion / questions.length) * 100} 
          sx={{ mb: 3 }}
        />

        <Typography variant="h6" gutterBottom>
          What does "{questions[currentQuestion]?.term}" mean?
        </Typography>

        <RadioGroup
          value={selectedAnswer}
          onChange={(e) => setSelectedAnswer(e.target.value)}
        >
          {questions[currentQuestion]?.options.map((option, index) => (
            <FormControlLabel
              key={index}
              value={option}
              control={<Radio />}
              label={option}
            />
          ))}
        </RadioGroup>

        <Button
          variant="contained"
          onClick={handleAnswer}
          disabled={!selectedAnswer}
          sx={{ mt: 2 }}
        >
          {currentQuestion + 1 < questions.length ? 'Next' : 'Finish'}
        </Button>
      </Paper>
    </Container>
  );
};

export default MedicalQuiz;