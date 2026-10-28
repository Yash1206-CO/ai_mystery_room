const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');

router.post('/', caseController.createCase);
router.get('/:id', caseController.getCase);
router.post('/:id/clues/:clueId/discover', caseController.discoverClue);
router.post('/:id/hints', caseController.requestHint);
router.post('/:id/accuse', caseController.submitAccusation);
router.get('/:id/result', caseController.getCaseResult);

module.exports = router;
