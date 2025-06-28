const Proposal = require('../models/proposal');

exports.listProposals = async (req, res) => {
  try {
    const proposals = await Proposal.findAll();
    return res.status(200).json({ success: true, data: proposals });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao obter propostas.' });
  }
};

exports.getProposalById = async (req, res) => {
  try {
    const proposal = await Proposal.findByPk(req.params.id);
    if (proposal) return res.json({ success: true, data: proposal });
    return res.status(404).json({ success: false, error: 'Proposta não encontrada.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao obter proposta.' });
  }
};

exports.createProposal = async (req, res) => {
  try {
    const proposal = await Proposal.create(req.body);
    return res.status(201).json({ success: true, data: proposal });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao criar proposta.' });
  }
};

exports.updateProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findByPk(req.params.id);
    if (!proposal) return res.status(404).json({ success: false, error: 'Proposta não encontrada.' });

    await proposal.update(req.body);
    return res.status(200).json({ success: true, message: 'Proposta atualizada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao atualizar proposta.' });
  }
};

exports.deleteProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findByPk(req.params.id);
    if (!proposal) return res.status(404).json({ success: false, error: 'Proposta não encontrada.' });

    await proposal.destroy();
    return res.status(200).json({ success: true, message: 'Proposta eliminada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao eliminar proposta.' });
  }
};

exports.validateProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findByPk(id);
    if (!proposal) return res.status(404).json({ success: false, error: 'Proposta não encontrada.' });

    proposal.status = 'validada'; 
    await proposal.save();

    return res.status(200).json({ success: true, message: 'Proposta validada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao validar proposta.' });
  }
};

exports.rejectProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findByPk(id);
    if (!proposal) return res.status(404).json({ success: false, error: 'Proposta não encontrada.' });

    proposal.status = 'rejeitada';
    await proposal.save();

    return res.status(200).json({ success: true, message: 'Proposta rejeitada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao rejeitar proposta.' });
  }
};

