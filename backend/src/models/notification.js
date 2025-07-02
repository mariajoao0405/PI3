const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const User = require('./User');
const Proposal = require('./proposal');

const Notification = sequelize.define('notifications', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: { model: User, key: 'id' },
    onDelete: 'CASCADE',
  },
  proposal_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: Proposal, key: 'id' },
    onDelete: 'SET NULL',
  },
  mensagem: {
    type: DataTypes.TEXT,
  },
  tipo: {
    type: DataTypes.ENUM('info', 'alerta', 'match'),
  },
  data_envio: {
    type: DataTypes.DATE,
  },
  lida: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'notifications',
  timestamps: false,
});

module.exports = Notification;