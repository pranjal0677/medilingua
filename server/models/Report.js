// models/Report.js
import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reportText: {
    type: String,
    required: true
  },
  analysis: {
    summary: String,
    keyPoints: [String],
    medicalTerms: [{
      term: String,
      explanation: String
    }],
    actions: [String],
    warnings: [String]
  }
}, {
  timestamps: true
});

export default mongoose.model('Report', reportSchema);