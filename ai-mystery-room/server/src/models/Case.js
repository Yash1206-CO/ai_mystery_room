const mongoose = require('mongoose');

const ClueSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  isDiscovered: { type: Boolean, default: false },
  discoveredAt: { type: Date, default: null }
});

const SuspectSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  bio: { type: String, required: true },
  alibi: { type: String, required: true },
  relationshipToVictim: { type: String, required: true }
});

const HintSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  isUnlocked: { type: Boolean, default: false },
  unlockedAt: { type: Date, default: null }
});

const CaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  premise: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'], 
    required: true 
  },
  story: {
    victim: { type: String, required: true },
    crimeScene: { type: String, required: true },
    background: { type: String, required: true },
    timeOfIncident: { type: String, required: true }
  },
  suspects: [SuspectSchema],
  clues: [ClueSchema],
  hints: [HintSchema],
  
  // Security Requirement:
  // Hidden by default from query results to prevent premature client leaks
  solution: {
    culpritSuspectId: { type: String, required: true, select: false },
    culpritName: { type: String, required: true, select: false },
    motive: { type: String, required: true, select: false },
    method: { type: String, required: true, select: false },
    fullExplanation: { type: String, required: true, select: false }
  },
  
  status: { 
    type: String, 
    enum: ['active', 'solved', 'unsolved'], 
    default: 'active' 
  },
  accusation: {
    accusedSuspectId: { type: String, default: null },
    notes: { type: String, default: null },
    isCorrect: { type: Boolean, default: null },
    accusedAt: { type: Date, default: null }
  },
  score: {
    basePoints: { type: Number, default: 0 },
    clueBonus: { type: Number, default: 0 },
    hintPenalty: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Case', CaseSchema);
