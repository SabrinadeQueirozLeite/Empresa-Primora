require("dotenv").config(); // Carrega as variáveis de ambiente do arquivo .env

const db = require("./db"); // Importa o módulo de conexão com o banco de dados
const port = process.env.PORT || 3000; // Define a porta do servidor, usando a variável de ambiente ou padrão 3000

const express = require("express"); // Importa o framework Express para criar o servidor
const app = express(); // Cria uma instância do aplicativo Express

app.use(express.json()); // Middleware para interpretar requisições com corpo em JSON

// Rota de teste para verificar se o servidor está funcionando
app.get("/", (req, res) => {
  res.send("Servidor rodando com sucesso! no IFB");
});

app.get("/empresas", async (req, res) => {
  const empresas = await db.selecionarempresa();
  res.status(200).json(empresas);
});

app.post("/empresas", async (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ erro: "O corpo deve ser um objeto JSON." });
  }

  const empresa = await db.adicionarempresa(req.body);
  res.status(201).json(empresa);
});

app.get("/telefones", async (req, res) => {
  const telefones = await db.selecionarTelefone();
  res.status(200).json(telefones);
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
    await db.encerrarConexao();
    process.exitCode = 1;
  }
}

iniciarServidor();
