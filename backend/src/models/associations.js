const User = require('./User');
const StudentProfile = require('./studentProfile');
const CompanyProfile = require('./CompanyProfile');
const DepartmentManagerProfile = require('./departmentProfile');
const Proposal = require('./proposal');
const ProposalMatch = require('./proposalMatch');
const Notification = require('./notification');

// =====================
// USER PROFILES
// =====================
User.hasOne(StudentProfile, { foreignKey: 'user_id', as: 'student_profile' });
StudentProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(CompanyProfile, { foreignKey: 'user_id', as: 'company_profile' });
CompanyProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(DepartmentManagerProfile, { foreignKey: 'user_id', as: 'department_profile' });
DepartmentManagerProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// =====================
// PROPOSAL ASSOCIATIONS
// =====================

// User como criador da proposta
User.hasMany(Proposal, { foreignKey: 'user_id', as: 'propostas_criadas' });
Proposal.belongsTo(User, { foreignKey: 'user_id', as: 'criador' });

// User como validador da proposta
User.hasMany(Proposal, { foreignKey: 'validada_por_id', as: 'propostas_validadas' });
Proposal.belongsTo(User, { foreignKey: 'validada_por_id', as: 'validador' });

// Company-Proposal association
CompanyProfile.hasMany(Proposal, { foreignKey: 'empresa_id', as: 'propostas' });
Proposal.belongsTo(CompanyProfile, { foreignKey: 'empresa_id', as: 'company_profile' });

// CORRIGIDO: Department-Proposal association
// Remover esta associação problemática - não há campo department_id na tabela proposals
// DepartmentManagerProfile.hasMany(Proposal, { foreignKey: 'id', as: 'propostas_departamento' });
// Proposal.belongsTo(DepartmentManagerProfile, { foreignKey: 'id', as: 'departamento' });

// =====================
// PROPOSAL MATCHES
// =====================
Proposal.hasMany(ProposalMatch, { foreignKey: 'proposal_id', as: 'matches' });
ProposalMatch.belongsTo(Proposal, { foreignKey: 'proposal_id', as: 'proposal' });

StudentProfile.hasMany(ProposalMatch, { foreignKey: 'student_id', as: 'matches' });
ProposalMatch.belongsTo(StudentProfile, { foreignKey: 'student_id', as: 'student_profile' });

// =====================
// NOTIFICATIONS
// =====================
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Proposal.hasMany(Notification, { foreignKey: 'proposal_id', as: 'notifications' });
Notification.belongsTo(Proposal, { foreignKey: 'proposal_id', as: 'proposal' });
