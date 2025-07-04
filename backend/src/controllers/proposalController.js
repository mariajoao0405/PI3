const Proposal = require('../models/proposal');
const User = require('../models/User');
const CompanyProfile = require('../models/CompanyProfile');
const StudentProfile = require('../models/studentProfile');
const ProposalMatch = require('../models/proposalMatch'); // ESTA LINHA
const DepartmentProfile = require('../models/departmentProfile');

exports.listProposals = async (req, res) => {
  try {
    const proposals = await Proposal.findAll({
      include: [
        {
          model: User,
          as: 'criador',
          attributes: ['id', 'nome', 'email_institucional', 'tipo_utilizador'],
          include: [
            {
              model: DepartmentProfile,
              attributes: ['id', 'departamento'],
              required: false // LEFT JOIN para não excluir propostas sem departamento
            }
          ]
        },
        {
          model: CompanyProfile,
          attributes: ['id', 'nome_empresa', 'nif', 'website']
        }
      ],
      order: [['data_submissao', 'DESC']] // Ordenar por data mais recente
    });

    console.log('📊 [DEBUG] Total de propostas encontradas:', proposals.length);

    // Debug: verificar estrutura dos dados
    if (proposals.length > 0) {
      console.log('🔍 [DEBUG] Primeira proposta:', JSON.stringify(proposals[0], null, 2));
    }

    return res.status(200).json({ success: true, data: proposals });
  } catch (error) {
    console.error('❌ Erro ao obter propostas:', error);
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
    const estado = userType === 'administrador' || userType === 'gestor' ? 'ativa' : 'pendente';

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

    if (proposal.estado === 'removida') {
      return res.status(400).json({ success: false, error: 'Propostas removidas não podem ser editadas.' });
    }

    await proposal.update(req.body);
    return res.status(200).json({ success: true, message: 'Proposta atualizada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao atualizar proposta.' });
  }
};


exports.validateProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findByPk(id);
    if (!proposal) return res.status(404).json({ success: false, error: 'Proposta não encontrada.' });

    proposal.estado = 'ativa';
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

    proposal.estado = 'inativa';
    await proposal.save();

    return res.status(200).json({ success: true, message: 'Proposta rejeitada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao rejeitar proposta.' });
  }
};

exports.inactivateProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findByPk(id);
    if (!proposal) {
      return res.status(404).json({ success: false, error: 'Proposta não encontrada.' });
    }

    // Só propostas ativas podem ser desativadas
    if (proposal.estado !== 'ativa') {
      return res.status(400).json({ success: false, error: 'Apenas propostas ativas podem ser desativadas.' });
    }

    proposal.estado = 'inativa';
    await proposal.save();

    return res.status(200).json({ success: true, message: 'Proposta desativada com sucesso.' });
  } catch (error) {
    console.error('Erro ao desativar proposta:', error);
    return res.status(500).json({ success: false, error: 'Erro ao desativar proposta.' });
  }
};

exports.removeProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findByPk(id);

    if (!proposal) {
      return res.status(404).json({ success: false, error: 'Proposta não encontrada.' });
    }

    await proposal.destroy();
    return res.status(200).json({ success: true, message: 'Proposta apagada permanentemente.' });
  } catch (error) {
    console.error('Erro ao apagar proposta:', error);
    return res.status(500).json({ success: false, error: 'Erro ao apagar proposta.' });
  }
};

exports.reactivateProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findByPk(id);
    if (!proposal) return res.status(404).json({ success: false, error: 'Proposta não encontrada.' });

    // Apenas propostas inativas podem ser reativadas
    if (proposal.estado !== 'inativa') {
      return res.status(400).json({ success: false, error: 'Apenas propostas inativas podem ser reativadas.' });
    }

    proposal.estado = 'ativa';
    proposal.reativada_em = new Date();
    await proposal.save();

    return res.status(200).json({ success: true, message: 'Proposta reativada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao reativar proposta.' });
  }
};




exports.listProposalsByCompany = async (req, res) => {
  try {
    const { empresaId } = req.params;

    // Verifica se a empresa existe
    const empresa = await CompanyProfile.findByPk(empresaId);
    if (!empresa) {
      return res.status(404).json({ success: false, error: 'Empresa não encontrada.' });
    }

    // Busca as propostas associadas à empresa
    const propostas = await Proposal.findAll({
      where: { empresa_id: empresaId },
      include: [
        {
          model: User,
          as: 'criador',
          attributes: ['id', 'nome', 'email_institucional']
        },
        {
          model: CompanyProfile,
          as: 'company_profile',
          attributes: ['id', 'nome_empresa', 'nif', 'website']
        }
      ]
    });

    return res.status(200).json({ success: true, data: propostas });
  } catch (error) {
    console.error('Erro ao listar propostas por empresa:', error);
    return res.status(500).json({ success: false, error: 'Erro ao listar propostas por empresa.' });
  }
};


exports.assignProposalToStudent = async (req, res) => {
  try {
    const { proposal_id, student_id } = req.body;
    const userId = req.user.id;

    // Verificar se a proposta existe
    const proposal = await Proposal.findByPk(proposal_id);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposta não encontrada.'
      });
    }

    // Verificar se o estudante existe
    const student = await StudentProfile.findByPk(student_id);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Estudante não encontrado.'
      });
    }

    // Buscar perfil da empresa
    const companyProfile = await CompanyProfile.findOne({
      where: { user_id: userId }
    });
    if (!companyProfile) {
      return res.status(404).json({
        success: false,
        error: 'Perfil da empresa não encontrado.'
      });
    }

    // Verificar se a proposta pertence à empresa
    if (proposal.empresa_id !== companyProfile.id) {
      return res.status(403).json({
        success: false,
        error: 'Você não tem permissão para atribuir esta proposta.'
      });
    }

    // Verificar se já existe atribuição
    const existingMatch = await ProposalMatch.findOne({
      where: {
        proposal_id,
        student_id
      }
    });

    if (existingMatch) {
      return res.status(400).json({
        success: false,
        error: 'Esta proposta já foi atribuída a este estudante.'
      });
    }

    // Criar a atribuição
    const match = await ProposalMatch.create({
      proposal_id,
      student_id,
      empresa_id: companyProfile.id,
      estado: 'pendente',
      data_atribuicao: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Proposta atribuída com sucesso!',
      data: match
    });

  } catch (error) {
    console.error('Erro ao atribuir proposta:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao atribuir proposta.'
    });
  }
};

exports.getProposalWithAssignments = async (req, res) => {
  try {
    const { proposal_id } = req.params;

    const assignments = await ProposalMatch.findAll({
      where: { proposal_id },
      include: [
        {
          model: StudentProfile,
          include: [
            {
              model: User,
              attributes: ['id', 'nome', 'email_institucional']
            }
          ]
        }
      ],
    });

    return res.status(200).json({
      success: true,
      data: assignments
    });

  } catch (error) {
    console.error('Erro ao buscar atribuições:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar atribuições.'
    });
  }
};


