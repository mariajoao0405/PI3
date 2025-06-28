const StudentProfile = require('../models/studentProfile');

exports.listStudents = async (req, res) => {
  try {
    const students = await StudentProfile.findAll();
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
