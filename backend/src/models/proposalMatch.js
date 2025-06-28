const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const Proposal = require('./proposal');
const StudentProfile = require('./studentProfile');

const ProposalMatch = sequelize.define('proposal_matches', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  proposal_id: {
    type: DataTypes.INTEGER,
    references: { model: Proposal, key: 'id' },
    onDelete: 'CASCADE',
  },
  student_id: {
    type: DataTypes.INTEGER,
    references: { model: StudentProfile, key: 'id' },
    onDelete: 'CASCADE',
  },
  score: {
    type: DataTypes.FLOAT,
  },
  notificado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
  type: DataTypes.ENUM('pendente', 'validada', 'rejeitada'),
  allowNull: false,
  defaultValue: 'pendente'
}
}, {
  tableName: 'proposal_matches',
  timestamps: false,
});

module.exports = ProposalMatch;