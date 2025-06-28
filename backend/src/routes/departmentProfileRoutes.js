const express = require('express');
const router = express.Router();

const DepartmentProfileController = require('../controllers/departmentProfileController');

router.get('/managers', DepartmentProfileController.listManagers);
router.get('/managers/:id', DepartmentProfileController.getManagerById);
router.post('/managers', DepartmentProfileController.createManager);
router.put('/managers/:id', DepartmentProfileController.updateManager);
router.delete('/managers/:id', DepartmentProfileController.deleteManager);

module.exports = router;