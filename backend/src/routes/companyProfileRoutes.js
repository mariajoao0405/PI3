const express = require('express');
const router = express.Router();

const companyProfileController = require('../controllers/companyProfileController');

router.get('/companies', companyProfileController.listCompanies);
router.get('/companies/:id', companyProfileController.getCompanyById);
router.get('/user/:user_id', companyProfileController.getCompanyByUserId);
router.post('/companies', companyProfileController.createCompany);
router.put('/companies/:id', companyProfileController.updateCompany);
router.delete('/companies/:id', companyProfileController.deleteCompany);

module.exports = router;