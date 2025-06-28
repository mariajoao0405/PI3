const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const User = require('../models/User');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email e password são obrigatórios.' });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email_institucional: email },
          { email_pessoal: email }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      {
        id_user: user.id,
        tipo_utilizador: user.tipo_utilizador
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login efetuado com sucesso.',
      token,
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ success: false, message: 'Erro ao efetuar login.' });
  }
};

exports.register = async (req, res) => {
  try {
    const { nome, email_institucional, password, tipo_utilizador } = req.body;

    if (!nome || !password || !email_institucional || !tipo_utilizador) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios em falta.' });
    }

    const emailExistente = await User.findOne({
      where: { email_institucional }
    });

    if (emailExistente) {
      return res.status(400).json({ success: false, message: 'Email institucional já registado.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const novoUser = await User.create({
      nome,
      email_institucional,
      password_hash,
      tipo_utilizador
    });

    return res.status(201).json({
      success: true,
      message: 'Utilizador registado com sucesso.',
    });
  } catch (error) {
    console.error('Erro no registo:', error);
    return res.status(500).json({ success: false, message: 'Erro ao registar utilizador.' });
  }
};