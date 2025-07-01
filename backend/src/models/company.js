const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const CompanyProfile = sequelize.define('company', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
    tableName: 'company',
    timestamps: false,
});

module.exports = CompanyProfile;