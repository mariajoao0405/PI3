const Sequelize = require('sequelize');
require('dotenv').config();

const connectionString = process.env.REACT_APP_API_URL || null;

const sequelize = connectionString
  ? new Sequelize(connectionString, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  })
  : new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'postgres',
    }
  );

module.exports = sequelize;

sequelize
  .authenticate()
  .then(() => {
    console.log("Conexão com o banco de dados realizada com sucesso.");
  })
  .catch((err) => {
    console.error("Erro: Conexão com o banco de dados não realizada com sucesso.", err.message);
  });
