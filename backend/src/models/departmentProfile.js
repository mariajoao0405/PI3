const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const User = require('./User');

const DepartmentProfile = sequelize.define('department_profiles', {
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
  departamento: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'department_profiles',
  timestamps: false,
});

module.exports = DepartmentProfile;