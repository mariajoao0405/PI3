const bcrypt = require('bcrypt');
const { User } = require('../models');

// Tipos válidos de utilizador
const TIPOS_VALIDOS = ['administrador', 'gestor', 'estudante', 'empresa'];

// Listar todos os utilizadores (sem password)
exports.listUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] }
    });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Erro ao listar utilizadores:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao buscar utilizadores"
    });
  }
};

// Obter utilizador por ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Utilizador não encontrado" });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Erro ao buscar utilizador:", error);
    return res.status(500).json({ success: false, message: "Erro ao buscar utilizador" });
  }
};

// Criar utilizador (sem validação de tipo - versão simples)
exports.createUser = async (req, res) => {
  try {
    const { nome, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      nome,
      email,
      password_hash: hashedPassword
    });

    return res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        nome: newUser.nome,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error("Erro ao criar utilizador:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao criar utilizador"
    });
  }
};

// Criar utilizador com tipo de utilizador (com validação)
exports.createUserWithRole = async (req, res) => {
  try {
    const { nome, email, password, tipo_utilizador } = req.body;

    if (!TIPOS_VALIDOS.includes(tipo_utilizador)) {
      return res.status(400).json({
        success: false,
        message: "Tipo de utilizador inválido. Deve ser 'administrador', 'gestor', 'estudante' ou 'empresa'."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const novoUtilizador = await User.create({
      nome,
      email,
      password_hash: hashedPassword,
      tipo_utilizador
    });

    return res.status(201).json({
      success: true,
      data: {
        id: novoUtilizador.id,
        nome: novoUtilizador.nome,
        email: novoUtilizador.email,
        tipo_utilizador: novoUtilizador.tipo_utilizador
      }
    });

  } catch (error) {
    console.error("Erro ao criar utilizador:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao criar utilizador."
    });
  }
};

// Atualizar utilizador
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: "Utilizador não encontrado" });

    await user.update(req.body);
    console.info(`Utilizador ${id} atualizado`);

    return res.status(200).json({ success: true, message: "Utilizador atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar utilizador:", error);
    return res.status(500).json({ success: false, message: "Erro ao atualizar utilizador" });
  }
};

// Eliminar utilizador
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: "Utilizador não encontrado" });

    await user.destroy();
    console.info(`Utilizador ${id} eliminado`);

    return res.status(200).json({ success: true, message: "Utilizador eliminado com sucesso" });
  } catch (error) {
    console.error("Erro ao eliminar utilizador:", error);
    return res.status(500).json({ success: false, message: "Erro ao eliminar utilizador" });
  }
};
