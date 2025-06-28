const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// Rota de login
router.post('/login', AuthController.login);

// Rota de registo
router.post('/register', AuthController.register);

module.exports = router;
