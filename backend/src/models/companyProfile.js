const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const User = require('./User');

const CompanyProfile = sequelize.define('company_profiles', {
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
    nome_empresa: {
        type: DataTypes.STRING,
    },
    nif: {
        type: DataTypes.STRING,
    },
    website: {
        type: DataTypes.STRING,
    },
    morada: {
        type: DataTypes.STRING,
    },
    telefone_contacto: {
        type: DataTypes.STRING,
    },
}, {
    tableName: 'company_profiles',
    timestamps: false,
});

module.exports = CompanyProfile;