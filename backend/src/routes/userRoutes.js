const express = require('express');
const router = express.Router();

const UserController = require('../controllers/userController');

router.get('/users', UserController.listUsers);
router.get('/users/:id', UserController.getUserById);
router.post('/users', UserController.createUser);
router.post('/users/role', UserController.createUserWithRole);
router.put('/users/:id', UserController.updateUser);
router.delete('/users/:id', UserController.deleteUser);

module.exports = router;