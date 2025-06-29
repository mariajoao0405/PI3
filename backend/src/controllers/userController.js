const User = require('../models/User');

exports.listUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password_hash'] } });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Erro ao listar utilizadores:", error);
    return res.status(500).json({ success: false, message: "Erro ao buscar utilizadores" });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "Utilizador não encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar utilizador" });
  }
};

exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    return res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erro ao criar utilizador" });
  }
};

exports.createUserWithRole = async (req, res) => {
  try {
    const { email, password, tipo_utilizador } = req.body;

    const tiposValidos = ['administrador', 'gestor', 'estudante', 'empresa'];

    if (!tiposValidos.includes(tipo_utilizador)) {
      return res.status(400).json({
        success: false,
        message: "Tipo de utilizador inválido. Deve ser 'administrador', 'gestor', 'estudante' ou 'empresa'."
      });
    }

    const novoUtilizador = await User.create({
      nome,
      email,
      password,
      tipo_utilizador
    });

    return res.status(201).json({
      success: true
    });

  } catch (error) {
    console.error("Erro ao criar utilizador:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao criar utilizador."
    });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "Utilizador não encontrado" });

    await user.update(req.body);
    logger.info(`Utilizador ${id} atualizado`);
    return res.status(200).json({ success: true, message: "Utilizador atualizado com sucesso" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erro ao atualizar utilizador" });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "Utilizador não encontrado" });

    await user.destroy();
    logger.info(`Utilizador ${id} eliminado`);
    return res.status(200).json({ success: true, message: "Utilizador eliminado com sucesso" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erro ao eliminar utilizador" });
  }
};