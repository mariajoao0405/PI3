const express = require('express');
const router = express.Router();

const companyController = require('../controllers/companyController');

router.get('/companies', companyController.listCompanies);
router.get('/companies/:id', companyController.getCompanyById);
router.post('/companies', companyController.createCompany);
router.put('/companies/:id', companyController.updateCompany);
router.delete('/companies/:id', companyController.deleteCompany);

module.exports = router;