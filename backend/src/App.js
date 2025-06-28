const express = require("express");
const cors = require("cors");
require("dotenv").config();

const sequelize = require("./models/database");
require("./models/associations");

const userRoutes = require("./routes/userRoutes");
const studentRoutes = require("./routes/studentProfileRoutes");
const companyRoutes = require("./routes/companyProfileRoutes");
const managerRoutes = require("./routes/departmentProfileRoutes");
const proposalRoutes = require("./routes/proposalRoutes");
const matchRoutes = require("./routes/proposalRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const authRoutes = require("./routes/authRoutes");

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

// Rotas individuais
app.use("/users", userRoutes);
app.use("/students", studentRoutes);
app.use("/companies", companyRoutes);
app.use("/managers", managerRoutes);
app.use("/proposals", proposalRoutes);
app.use("/matches", matchRoutes);
app.use("/notifications", notificationRoutes);
app.use("/auth", authRoutes);

// Sincronizar base de dados
sequelize.sync({ force: false })
  .then(() => console.log("✅ Tabelas sincronizadas com sucesso!"))
  .catch(err => console.error("❌ Erro ao sincronizar tabelas:", err));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor a correr na porta ${PORT}`);
});
