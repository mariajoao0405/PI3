const express = require('express');
const router = express.Router();

const StudentProfileController = require('../controllers/studentProfileController');
const authenticateToken = require('../middleware/auth');

router.get('/students', StudentProfileController.listStudents);
router.get('/students/:id', StudentProfileController.getStudentById);
router.get('/user/:user_id', StudentProfileController.getStudentByUserId);
router.post('/students', StudentProfileController.createStudent);
router.put('/students/:id', StudentProfileController.updateStudent);
router.delete('/students/:id', StudentProfileController.deleteStudent);

// ADICIONAR ESTAS ROTAS:
router.get('/my-proposals', authenticateToken, StudentProfileController.getStudentProposals);


//pedido de remoção

router.post('/request-deletion', authenticateToken, StudentProfileController.requestAccountDeletion);


router.get('/deletion-requests', authenticateToken, StudentProfileController.listDeletionRequests);

router.delete('/deletion-requests/:id/approve', authenticateToken, StudentProfileController.approveDeletion);

module.exports = router;