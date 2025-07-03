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
    const student = await StudentProfile.findByPk(req.params.id);
    if (!student) return res.status(404).json({ success: false, error: 'Perfil não encontrado.' });

    await student.destroy();
    return res.status(200).json({ success: true, message: 'Perfil eliminado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao eliminar perfil.' });
  }
};
exports.getStudentByUserId = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ where: { user_id: req.params.user_id } });
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
