const CompanyProfile = require('../models/CompanyProfile');

exports.listCompanies = async (req, res) => {
  try {
    const companies = await CompanyProfile.findAll();
    return res.status(200).json({ success: true, data: companies });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao obter empresas.' });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const company = await CompanyProfile.findByPk(req.params.id);
    if (company) return res.json({ success: true, data: company });
    return res.status(404).json({ success: false, error: 'Empresa não encontrada.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao obter empresa.' });
  }
};

exports.createCompany = async (req, res) => {
  try {
    const company = await CompanyProfile.create(req.body);
    return res.status(201).json({ success: true, data: company });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao criar empresa.' });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const company = await CompanyProfile.findByPk(req.params.id);
    if (!company) return res.status(404).json({ success: false, error: 'Empresa não encontrada.' });

    await company.update(req.body);
    return res.status(200).json({ success: true, message: 'Empresa atualizada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao atualizar empresa.' });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const company = await CompanyProfile.findByPk(req.params.id);
    if (!company) return res.status(404).json({ success: false, error: 'Empresa não encontrada.' });

    await company.destroy();
    return res.status(200).json({ success: true, message: 'Empresa eliminada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao eliminar empresa.' });
  }
};