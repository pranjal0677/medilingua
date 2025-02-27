// models/MedicalTerm.js
import mongoose from 'mongoose';

const medicalTermSchema = new mongoose.Schema({
  term: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  explanation: {
    type: String,
    required: true
  },
  examples: [{
    type: String
  }],
  relatedTerms: [{
    type: String
  }],
  notes: String,
  searchCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('MedicalTerm', medicalTermSchema);