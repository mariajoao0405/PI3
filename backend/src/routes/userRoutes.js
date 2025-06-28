const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');

router.get('/users', UserController.listUsers);
router.get('/users/:id', UserController.getUserById);
router.post('/users', UserController.createUser);
router.put('/users/:id', UserController.updateUser);
router.delete('/users/:id', UserController.deleteUser);

module.exports = router;