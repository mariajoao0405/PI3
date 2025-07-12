const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acesso necessário.' 
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user - your authController uses id_user in the token
    const user = await User.findByPk(decoded.id_user);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Utilizador não encontrado.' 
      });
    }

    // Set req.user with the correct structure
    req.user = {
      id: user.id,  // This is what your proposalController expects
      nome: user.nome,
      email: user.email_institucional,
      tipo_utilizador: user.tipo_utilizador
    };

    console.log('🟢 [AUTH] User authenticated:', req.user);
    next();
  } catch (error) {
    console.error('❌ [AUTH] Error:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Token inválido.' 
    });
  }
};

module.exports = authenticateToken;