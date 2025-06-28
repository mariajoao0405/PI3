const express = require('express');
const router = express.Router();

const ProposalController = require('../controllers/proposalController');
const ProposalMatchController = require('../controllers/proposalMatchController');

// PROPOSALS
router.get('/proposals', ProposalController.listProposals);
router.get('/proposals/:id', ProposalController.getProposalById);
router.post('/proposals', ProposalController.createProposal);
router.put('/proposals/:id', ProposalController.updateProposal);
router.delete('/proposals/:id', ProposalController.deleteProposal);
router.put('/:id/validate', ProposalController.validateProposal);
router.put('/:id/reject', ProposalController.rejectProposal);

// MATCHES
router.get('/matches', ProposalMatchController.listMatches);
router.get('/matches/:id', ProposalMatchController.getMatchById);
router.post('/matches', ProposalMatchController.createMatch);
router.delete('/matches/:id', ProposalMatchController.deleteMatch);


module.exports = router;