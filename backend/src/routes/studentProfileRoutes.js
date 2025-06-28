const express = require('express');
const router = express.Router();

const StudentProfileController = require('../controllers/studentProfileController');

router.get('/students', StudentProfileController.listStudents);
router.get('/students/:id', StudentProfileController.getStudentById);
router.post('/students', StudentProfileController.createStudent);
router.put('/students/:id', StudentProfileController.updateStudent);
router.delete('/students/:id', StudentProfileController.deleteStudent);

module.exports = router;