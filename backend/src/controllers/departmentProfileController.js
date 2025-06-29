const DepartmentManagerProfile = require('../models/departmentProfile');
const User = require('../models/user');

exports.listManagers = async (req, res) => {
  try {
    const managers = await DepartmentManagerProfile.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nome', 'email_institucional']
      }]
    });

    return res.status(200).json({ success: true, data: managers });
  } catch (error) {
    console.error('Erro ao obter gestores:', error);
    return res.status(500).json({ success: false, message: 'Erro ao obter gestores.' });
  }
};

exports.getManagerById = async (req, res) => {
  try {
    const manager = await DepartmentManagerProfile.findByPk(req.params.id);
    if (manager) return res.json({ success: true, data: manager });
    return res.status(404).json({ success: false, error: 'Gestor não encontrado.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao obter gestor.' });
  }
};

exports.createManager = async (req, res) => {
  try {
    const manager = await DepartmentManagerProfile.create(req.body);
    return res.status(201).json({ success: true, data: manager });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao criar gestor.' });
  }
};

exports.updateManager = async (req, res) => {
  try {
    const manager = await DepartmentManagerProfile.findByPk(req.params.id);
    if (!manager) return res.status(404).json({ success: false, error: 'Gestor não encontrado.' });

    await manager.update(req.body);
    return res.status(200).json({ success: true, message: 'Gestor atualizado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao atualizar gestor.' });
  }
};

exports.deleteManager = async (req, res) => {
  try {
    const manager = await DepartmentManagerProfile.findByPk(req.params.id);
    if (!manager) return res.status(404).json({ success: false, error: 'Gestor não encontrado.' });

    await manager.destroy();
    return res.status(200).json({ success: true, message: 'Gestor eliminado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao eliminar gestor.' });
  }
};