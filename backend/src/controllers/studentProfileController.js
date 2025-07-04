const StudentProfile = require('../models/studentProfile');
const User = require('../models/User');
const ProposalMatch = require('../models/proposalMatch');
const Proposal = require('../models/proposal');
const CompanyProfile = require('../models/CompanyProfile');

exports.listStudents = async (req, res) => {
  try {
    const students = await StudentProfile.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nome', 'email_institucional']
      }]
    });
    return res.status(200).json({ success: true, data: students });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao obter perfis de estudantes.' });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await StudentProfile.findByPk(req.params.id);
    if (student) return res.json({ success: true, data: student });
    return res.status(404).json({ success: false, error: 'Perfil não encontrado.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao obter perfil.' });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const student = await StudentProfile.create(req.body);
    return res.status(201).json({ success: true, data: student });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao criar perfil.' });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await StudentProfile.findByPk(req.params.id);
    if (!student) return res.status(404).json({ success: false, error: 'Perfil não encontrado.' });

    await student.update(req.body);
    return res.status(200).json({ success: true, message: 'Perfil atualizado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao atualizar perfil.' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await StudentProfile.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'user'
      }]
    });

    if (!student) {
      return res.status(404).json({ success: false, error: 'Perfil não encontrado.' });
    }

    const user = student.user;

    // Remover perfil do estudante primeiro
    await student.destroy();

    // Remover usuário associado
    if (user) {
      await user.destroy();
    }

    return res.status(200).json({ success: true, message: 'Estudante e conta eliminados com sucesso.' });
  } catch (error) {
    console.error('Erro ao eliminar estudante:', error);
    return res.status(500).json({ success: false, error: 'Erro ao eliminar perfil.' });
  }
};


exports.getStudentByUserId = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({
      where: { user_id: req.params.user_id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nome', 'email_institucional']
      }]
    });
    if (student) return res.json({ success: true, data: student });
    return res.status(404).json({ success: false, error: 'Perfil não encontrado.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao obter perfil.' });
  }
};

exports.getStudentProposals = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar perfil do estudante
    const studentProfile = await StudentProfile.findOne({
      where: { user_id: userId }
    });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        error: 'Perfil do estudante não encontrado.'
      });
    }

    // Buscar propostas atribuídas ao estudante
    const proposalMatches = await ProposalMatch.findAll({
      where: { student_id: studentProfile.id },
      include: [
        {
          model: Proposal,
          include: [
            {
              model: CompanyProfile,
              attributes: ['id', 'nome_empresa', 'website', 'telefone_contacto']
            }
          ]
        }
      ],
    });

    return res.status(200).json({
      success: true,
      data: proposalMatches
    });

  } catch (error) {
    console.error('Erro ao buscar propostas do estudante:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar propostas.'
    });
  }
};


exports.requestAccountDeletion = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar perfil do estudante
    const studentProfile = await StudentProfile.findOne({
      where: { user_id: userId }
    });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        error: 'Perfil do estudante não encontrado.'
      });
    }

    // Verificar se já solicitou remoção
    if (studentProfile.remocao_solicitada) {
      return res.status(400).json({
        success: false,
        error: 'Você já solicitou a remoção desta conta.'
      });
    }

    // Marcar como solicitado para remoção
    await studentProfile.update({
      remocao_solicitada: true
    });

    return res.status(200).json({
      success: true,
      message: 'Pedido de remoção enviado com sucesso.'
    });

  } catch (error) {
    console.error('Erro ao solicitar remoção:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao processar pedido de remoção.'
    });
  }
};

// Listar pedidos de remoção (para admin/gestor)
exports.listDeletionRequests = async (req, res) => {
  try {
    const students = await StudentProfile.findAll({
      where: { remocao_solicitada: true },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nome', 'email_institucional']
      }],
      order: [['id', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: students
    });

  } catch (error) {
    console.error('Erro ao listar pedidos de remoção:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao listar pedidos de remoção.'
    });
  }
};

// Aprovar remoção (admin/gestor remove o estudante)
exports.approveDeletion = async (req, res) => {
  try {
    const { id } = req.params; // ID do StudentProfile

    const studentProfile = await StudentProfile.findByPk(id, {
      include: [{
        model: User,
        as: 'user'
      }]
    });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        error: 'Estudante não encontrado.'
      });
    }

    if (!studentProfile.remocao_solicitada) {
      return res.status(400).json({
        success: false,
        error: 'Este estudante não solicitou remoção da conta.'
      });
    }

    const user = studentProfile.user;

    // Remover perfil do estudante primeiro
    await studentProfile.destroy();

    // Remover usuário
    await user.destroy();

    return res.status(200).json({
      success: true,
      message: 'Conta do estudante removida com sucesso.'
    });

  } catch (error) {
    console.error('Erro ao aprovar remoção:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao remover conta do estudante.'
    });
  }
};
