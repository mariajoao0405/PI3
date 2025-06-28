const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const User = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
    },
    email_institucional: { 
        type: DataTypes.STRING, 
        unique: true 
    },
    email_pessoal: { 
        type: DataTypes.STRING 
    },
    password_hash: {
        type: DataTypes.STRING
    },
    tipo_utilizador: {
        type: DataTypes.ENUM('administrador', 'gestor', 'estudante', 'empresa')
    },
    ativo: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
    }
}, {
    tableName: 'users',
    timestamps: false
});

module.exports = User;