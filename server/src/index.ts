import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de teste
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API funcionando" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
