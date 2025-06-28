const express = require("express");
const cors = require("cors");
require("dotenv").config();

const sequelize = require("./models/database");
require("./models/associations");

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Sync DB
sequelize.sync({ force: false })
  .then(() => console.log("✅ Tabelas sincronizadas com sucesso!"))
  .catch(err => console.error("❌ Erro ao sincronizar tabelas:", err));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor a correr na porta ${PORT}`);
});
