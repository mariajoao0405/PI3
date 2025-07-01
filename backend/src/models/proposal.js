const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const CompanyProfile = require('./CompanyProfile');
const User = require('./user');

const Proposal = sequelize.define('proposals', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    references: { model: CompanyProfile, key: 'id' },
    onDelete: 'CASCADE',
  },
  validada_por_id: {
    type: DataTypes.INTEGER,
    references: { model: User, key: 'id' },
    onDelete: 'SET NULL',
  },
  titulo: {
    type: DataTypes.STRING,
  },
  tipo_proposta: {
    type: DataTypes.ENUM('emprego', 'estágio', 'outra'),
  },
  descricao: {
    type: DataTypes.TEXT,
  },
  perfil_candidato: {
    type: DataTypes.STRING,
  },
  local_trabalho: {
    type: DataTypes.STRING,
  },
  prazo_candidatura: {
    type: DataTypes.DATE,
  },
  tipo_contrato: {
    type: DataTypes.STRING,
  },
  competencias_tecnicas: {
    type: DataTypes.TEXT,
  },
  soft_skills: {
    type: DataTypes.TEXT,
  },
  contacto_nome: {
    type: DataTypes.STRING,
  },
  contacto_email: {
    type: DataTypes.STRING,
  },
  estado: {
    type: DataTypes.ENUM('pendente', 'ativa', 'inativa', 'removida'),
  },
  data_submissao: {
    type: DataTypes.DATE,
  },
  reativada_em: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'proposals',
  timestamps: false,
});

module.exports = Proposal;