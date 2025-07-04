const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const User = require('./User');

const StudentProfile = sequelize.define('student_profiles', {
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
    curso: {
        type: DataTypes.STRING,
    },
    ano: {
        type: DataTypes.STRING,
    },
    idade: {
        type: DataTypes.INTEGER,
    },
    areas_interesse: {
        type: DataTypes.TEXT,
    },
    competencias_tecnicas: {
        type: DataTypes.TEXT,
    },
    soft_skills: {
        type: DataTypes.TEXT,
    },
    cv_url: {
        type: DataTypes.STRING,
    },
    data_registo: {
        type: DataTypes.DATE,
    },
    remocao_solicitada: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'student_profiles',
    timestamps: false,
});

module.exports = StudentProfile;