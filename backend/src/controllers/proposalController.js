const Proposal = require('../models/proposal');
const User = require('../models/User');
const CompanyProfile = require('../models/CompanyProfile');

exports.listProposals = async (req, res) => {
  try {
    const proposals = await Proposal.findAll({
      include: [
        {
          model: User,
          as: 'criador', // Use o alias definido nas associações
          attributes: ['id', 'nome', 'email_institucional']
        },
        {
          model: CompanyProfile,
          attributes: ['id', 'nome_empresa', 'nif', 'website']
        }
      ]
    });
    return res.status(200).json({ success: true, data: proposals });
  } catch (error) {
    console.error('Erro ao obter propostas:', error);
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
    const { empresa_id, ...dadosProposta } = req.body;

    console.log('🟡 [DEBUG] Dados recebidos no body:', req.body);
    console.log('🟡 [DEBUG] req.user:', req.user);

    // Validate required fields
    if (!empresa_id) {
      return res.status(400).json({ success: false, error: 'empresa_id é obrigatório.' });
    }

    // Verifica se a empresa existe
    const empresa = await CompanyProfile.findByPk(empresa_id);
    if (!empresa) {
      console.warn('⚠️ Empresa não encontrada para ID:', empresa_id);
      return res.status(400).json({ success: false, error: 'Empresa inválida.' });
    }

    // Middleware já garante que req.user existe
    const userId = req.user.id;
    const userType = req.user.tipo_utilizador;
    
    console.log('✅ [DEBUG] Criando proposta com user_id:', userId);
    console.log('✅ [DEBUG] Tipo de utilizador:', userType);

    // Determinar o estado baseado no tipo de utilizador
    const estado = userType === 'administrador' ? 'ativa' : 'pendente';
    
    console.log('✅ [DEBUG] Estado da proposta:', estado);

    // Prepare data for creation
    const proposalData = {
      ...dadosProposta,
      empresa_id: parseInt(empresa_id),
      user_id: userId,
      estado: estado,
      data_submissao: new Date(),
    };

    console.log('🟡 [DEBUG] Dados para criar proposta:', proposalData);

    const novaProposta = await Proposal.create(proposalData);

    console.log('✅ Proposta criada com ID:', novaProposta.id, 'e estado:', estado);

    return res.status(201).json({ 
      success: true, 
      data: novaProposta,
      message: estado === 'ativa' 
        ? 'Proposta criada e ativada automaticamente (administrador).' 
        : 'Proposta criada e aguarda validação.'
    });
  } catch (error) {
    console.error('❌ Erro ao criar proposta:', error);
    
    // Better error handling
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        success: false, 
        error: 'Dados inválidos: ' + error.errors.map(e => e.message).join(', ') 
      });
    }
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        success: false, 
        error: 'Referência inválida. Verifique os IDs fornecidos.' 
      });
    }

    return res.status(500).json({ success: false, error: 'Erro interno ao criar proposta.' });
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

