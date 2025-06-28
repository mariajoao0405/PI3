const ProposalMatch = require('../models/ProposalMatch');

exports.listMatches = async (req, res) => {
  try {
    const matches = await ProposalMatch.findAll();
    return res.status(200).json({ success: true, data: matches });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao obter correspondências.' });
  }
};

exports.getMatchById = async (req, res) => {
  try {
    const match = await ProposalMatch.findByPk(req.params.id);
    if (match) return res.json({ success: true, data: match });
    return res.status(404).json({ success: false, error: 'Correspondência não encontrada.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao obter correspondência.' });
  }
};

exports.createMatch = async (req, res) => {
  try {
    const match = await ProposalMatch.create(req.body);
    return res.status(201).json({ success: true, data: match });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao criar correspondência.' });
  }
};

exports.deleteMatch = async (req, res) => {
  try {
    const match = await ProposalMatch.findByPk(req.params.id);
    if (!match) return res.status(404).json({ success: false, error: 'Correspondência não encontrada.' });

    await match.destroy();
    return res.status(200).json({ success: true, message: 'Correspondência eliminada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao eliminar correspondência.' });
  }
};