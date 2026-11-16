import "dotenv/config";
import express from "express";
import * as db from "./API/db.js";

const port = process.env.PORT || 3000; // Define a porta do servidor, usando a variável de ambiente ou padrão 3000

const app = express(); // Cria uma instância do aplicativo Express

app.use(express.json()); // Middleware para interpretar requisições com corpo em JSON

// Rota de teste para verificar se o servidor está funcionando
app.get("/", (req, res) => {
  res.send("Servidor Empresa Primora rodando com secesso!");
});

app.get("/empresas", async (req, res, next) => {
  try {
    const empresas = await db.selecionarempresa();
    res.status(200).json(empresas);
  } catch (error) {
    next(error);
  }
});

app.post("/empresas", async (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ erro: "O corpo deve ser um objeto JSON." });
  }

  const empresa = await db.adicionarEmpresa(req.body);
  res.status(201).json(empresa);
});

app.get("/telefones", async (req, res, next) => {
  try {
    const telefones = await db.selecionarTelefone();
    res.status(200).json(telefones);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error("Erro ao processar a requisição:", error);
  res.status(500).json({ erro: "Não foi possível concluir a operação." });
});

async function iniciarServidor() {
  try {
    await db.verificarConexao();
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  } catch (error) {
    console.error("Não foi possível conectar ao banco de dados:", error);
    await db.encerrarConexao?.();
    process.exitCode = 1;
  }
}

iniciarServidor();
