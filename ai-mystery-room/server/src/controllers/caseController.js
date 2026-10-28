const Case = require('../models/Case');
const { generateMystery } = require('../services/geminiService');

const SCORING_RULES = {
  Easy: 100,
  Medium: 150,
  Hard: 200,
  CLUE_BONUS: 5,
  HINT_PENALTY: 10
};

// POST /api/cases
exports.createCase = async (req, res) => {
  try {
    const { premise, difficulty = 'Easy' } = req.body;
    
    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'Difficulty must be Easy, Medium, or Hard' });
    }

    const aiData = await generateMystery(premise, difficulty);

    const newCase = new Case({
      title: aiData.title,
      premise: premise || 'A mysterious crime scene',
      difficulty,
      story: aiData.story,
      suspects: aiData.suspects,
      clues: aiData.clues.map(c => ({
        id: c.id,
        title: c.title,
        location: c.location,
        description: c.description,
        isDiscovered: false
      })),
      hints: aiData.hints.map(h => ({
        id: h.id,
        text: h.text,
        isUnlocked: false
      })),
      solution: aiData.solution
    });

    await newCase.save();

    // Sanitize response: mask undiscovered clue descriptions
    const sanitized = newCase.toObject();
    delete sanitized.solution;
    sanitized.clues = sanitized.clues.map(c => ({
      id: c.id,
      title: c.title,
      location: c.location,
      isDiscovered: false
    }));

    res.status(201).json({
      success: true,
      caseId: newCase._id,
      case: sanitized
    });
  } catch (error) {
    console.error('Create case error:', error);
    res.status(500).json({ error: error.message || 'Failed to create case' });
  }
};

// GET /api/cases/:id
exports.getCase = async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const sanitized = caseDoc.toObject();
    // Mask descriptions of undiscovered clues if active
    if (sanitized.status === 'active') {
      sanitized.clues = sanitized.clues.map(c => {
        if (!c.isDiscovered) {
          const { description, ...rest } = c;
          return rest;
        }
        return c;
      });
    }

    res.json({ success: true, case: sanitized });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/cases/:id/clues/:clueId/discover
exports.discoverClue = async (req, res) => {
  try {
    const { id, clueId } = req.params;
    const caseDoc = await Case.findById(id);
    if (!caseDoc) return res.status(404).json({ error: 'Case not found' });

    const clue = caseDoc.clues.find(c => c.id === clueId);
    if (!clue) return res.status(404).json({ error: 'Clue not found' });

    if (!clue.isDiscovered) {
      clue.isDiscovered = true;
      clue.discoveredAt = new Date();
      await caseDoc.save();
    }

    const discoveredCount = caseDoc.clues.filter(c => c.isDiscovered).length;
    res.json({
      success: true,
      clue,
      cluesDiscovered: discoveredCount,
      currentClueBonus: discoveredCount * SCORING_RULES.CLUE_BONUS
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/cases/:id/hints
exports.requestHint = async (req, res) => {
  try {
    const { id } = req.params;
    const caseDoc = await Case.findById(id);
    if (!caseDoc) return res.status(404).json({ error: 'Case not found' });

    const nextHint = caseDoc.hints.find(h => !h.isUnlocked);
    if (!nextHint) {
      return res.status(400).json({ error: 'No more hints available for this case' });
    }

    nextHint.isUnlocked = true;
    nextHint.unlockedAt = new Date();
    await caseDoc.save();

    const hintsUnlocked = caseDoc.hints.filter(h => h.isUnlocked).length;
    const remaining = caseDoc.hints.length - hintsUnlocked;

    res.json({
      success: true,
      hint: nextHint,
      hintsRemaining: remaining,
      totalHintsUsed: hintsUnlocked,
      currentPenalty: hintsUnlocked * SCORING_RULES.HINT_PENALTY
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/cases/:id/accuse
exports.submitAccusation = async (req, res) => {
  try {
    const { id } = req.params;
    const { accusedSuspectId, notes } = req.body;

    if (!accusedSuspectId) {
      return res.status(400).json({ error: 'accusedSuspectId is required' });
    }

    // Explicitly select solution which is hidden by default
    const caseDoc = await Case.findById(id).select('+solution.culpritSuspectId +solution.culpritName +solution.motive +solution.method +solution.fullExplanation');
    if (!caseDoc) return res.status(404).json({ error: 'Case not found' });

    if (caseDoc.status !== 'active') {
      return res.status(400).json({ error: 'Accusation already submitted for this case' });
    }

    const isCorrect = caseDoc.solution.culpritSuspectId === accusedSuspectId;
    const basePoints = isCorrect ? (SCORING_RULES[caseDoc.difficulty] || 100) : 0;
    const discoveredCluesCount = caseDoc.clues.filter(c => c.isDiscovered).length;
    const hintsUsedCount = caseDoc.hints.filter(h => h.isUnlocked).length;

    const clueBonus = discoveredCluesCount * SCORING_RULES.CLUE_BONUS;
    const hintPenalty = hintsUsedCount * SCORING_RULES.HINT_PENALTY;
    const totalScore = Math.max(0, basePoints + clueBonus - hintPenalty);

    caseDoc.status = isCorrect ? 'solved' : 'unsolved';
    caseDoc.accusation = {
      accusedSuspectId,
      notes: notes || '',
      isCorrect,
      accusedAt: new Date()
    };
    caseDoc.score = {
      basePoints,
      clueBonus,
      hintPenalty,
      totalScore
    };

    await caseDoc.save();

    res.json({
      success: true,
      verdict: isCorrect ? 'Case Solved!' : 'Case Unsolved / Suspect Exonerated',
      isCorrect,
      score: caseDoc.score,
      solution: caseDoc.solution
    });
  } catch (error) {
    console.error('Accusation error:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/cases/:id/result
exports.getCaseResult = async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id).select('+solution.culpritSuspectId +solution.culpritName +solution.motive +solution.method +solution.fullExplanation');
    if (!caseDoc) return res.status(404).json({ error: 'Case not found' });

    if (caseDoc.status === 'active') {
      return res.status(400).json({ error: 'Cannot view results of an active case before submitting an accusation' });
    }

    res.json({
      success: true,
      status: caseDoc.status,
      accusation: caseDoc.accusation,
      score: caseDoc.score,
      solution: caseDoc.solution,
      case: caseDoc
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
