const express = require('express');
const router = express.Router();

const ProposalController = require('../controllers/proposalController');
const ProposalMatchController = require('../controllers/proposalMatchController');
const authenticateToken = require('../middleware/auth');

// PROPOSALS
router.get('/proposals', ProposalController.listProposals);
router.get('/proposals/:id', ProposalController.getProposalById);
router.post('/proposals', authenticateToken, ProposalController.createProposal); 
router.put('/proposals/:id', authenticateToken, ProposalController.updateProposal);
router.put('/:id/validate', authenticateToken, ProposalController.validateProposal);
router.put('/:id/reject', authenticateToken, ProposalController.rejectProposal);
router.put('/:id/remove', authenticateToken, ProposalController.removeProposal);
router.put('/:id/reactivate', authenticateToken, ProposalController.reactivateProposal);
router.get('/empresa/:empresaId',authenticateToken, ProposalController.listProposalsByCompany);

// MATCHES
router.get('/matches', ProposalMatchController.listMatches);
router.get('/matches/:id', ProposalMatchController.getMatchById);
router.post('/matches', authenticateToken, ProposalMatchController.createMatch);
router.delete('/matches/:id', authenticateToken, ProposalMatchController.deleteMatch);

module.exports = router;