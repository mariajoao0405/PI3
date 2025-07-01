const User = require('./user');
const StudentProfile = require('./studentProfile');
const CompanyProfile = require('./company');
const DepartmentManagerProfile = require('./departmentProfile');
const Proposal = require('./proposal');
const ProposalMatch = require('./proposalMatch');
const Notification = require('./notification');

User.hasOne(StudentProfile, { foreignKey: 'user_id' });
StudentProfile.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(DepartmentManagerProfile, { foreignKey: 'user_id' });
DepartmentManagerProfile.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Proposal, { foreignKey: 'validada_por_id', as: 'propostas_validadas' });
Proposal.belongsTo(User, { foreignKey: 'validada_por_id', as: 'validador' });

User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

CompanyProfile.hasMany(Proposal, { foreignKey: 'empresa_id' });
Proposal.belongsTo(CompanyProfile, { foreignKey: 'empresa_id' });

Proposal.hasMany(ProposalMatch, { foreignKey: 'proposal_id' });
ProposalMatch.belongsTo(Proposal, { foreignKey: 'proposal_id' });

StudentProfile.hasMany(ProposalMatch, { foreignKey: 'student_id' });
ProposalMatch.belongsTo(StudentProfile, { foreignKey: 'student_id' });

Proposal.hasMany(Notification, { foreignKey: 'proposal_id' });
Notification.belongsTo(Proposal, { foreignKey: 'proposal_id' });
