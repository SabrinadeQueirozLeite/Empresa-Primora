import "dotenv/config"; // Carrega as variáveis de ambiente do arquivo .env
import express from "express"; // Importa o framework Express para criar o servidor
import db from "./db.js"; // Importa o módulo de conexão com o banco de dados
import path from "path";
import { fileURLToPath } from "url";

import { autenticarToken } from "./auth.js";

const port = process.env.PORT || 3000; // Porta do servidor (padrão 3000)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express(); // Cria uma instância do aplicativo Express

app.use(express.json()); // Middleware para interpretar requisições com corpo em JSON

// Página de apresentação (API/public/index.html), servida em http://localhost:3000/
app.use(express.static(path.join(__dirname, "public")));

// Rota de teste para verificar se o servidor está funcionando
app.get("/", (req, res) => {
  res.send("Servidor Empresa Primora rodando com sucesso!");
});

app.get("/empresas", async (req, res, next) => {
  try {
    const empresas = await db.selecionarEmpresas();
    res.status(200).json(empresas);
  } catch (error) {
    next(error);
  }
});

app.get("/telefones", async (req, res, next) => {
  try {
    const telefones = await db.selecionarTelefone();
    res.status(200).json(telefones);
  } catch (error) {
    next(error);
  }
});

// Uma empresa com vendedor, endereço e telefones
app.get("/empresas/:id", async (req, res, next) => {
  try {
    const empresa = await db.selecionarEmpresaPorId(req.params.id);
    if (!empresa) {
      return res.status(404).json({ erro: "Empresa não encontrada." });
    }
    res.status(200).json(empresa);
  } catch (error) {
    next(error);
  }
});

// Por que esta empresa ficou assim? (a auditoria)
app.get("/empresas/:id/auditoria", async (req, res, next) => {
  try {
    const auditoria = await db.selecionarAuditoria(req.params.id);
    res.status(200).json(auditoria);
  } catch (error) {
    next(error);
  }
});

// Relatório agregado: quantas empresas por bairro
app.get("/relatorios/bairros", async (req, res, next) => {
  try {
    const bairros = await db.contarEmpresasPorBairro();
    res.status(200).json(bairros);
  } catch (error) {
    next(error);
  }
});

// Relatório de auditoria: quantos ajustes por campo e por fonte
app.get("/relatorios/ajustes", async (req, res, next) => {
  try {
    const ajustes = await db.contarAjustes();
    res.status(200).json(ajustes);
  } catch (error) {
    next(error);
  }
});

app.post("/empresas", autenticarToken, async (req, res, next) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ erro: "O corpo deve ser um objeto JSON." });
  }

  const { id_empresa, razao_social, cnpj } = req.body;
  if (!id_empresa || !razao_social || !cnpj) {
    return res
      .status(400)
      .json({ erro: "Campos obrigatórios: id_empresa, razao_social e cnpj." });
  }

  try {
    const empresa = await db.adicionarEmpresa(req.body);
    res.status(201).json(empresa);
  } catch (error) {
    next(error);
  }
});

app.put("/empresas/:id", autenticarToken, async (req, res, next) => {
  try {
    const empresa = await db.atualizarEmpresa(
      req.params.id,
      req.body
    );

    if (!empresa) {
      return res.status(404).json({
        erro: "Empresa não encontrada."
      });
    }

    res.status(200).json(empresa);
  } catch (error) {
    next(error);
  }
});

app.delete("/empresas/:id", autenticarToken, async (req, res, next) => {
  try {
    const empresa = await db.excluirEmpresa(req.params.id);

    if (!empresa) {
      return res.status(404).json({
        erro: "Empresa não encontrada."
      });
    }

    res.status(200).json({
      mensagem: "Empresa excluída com sucesso."
    });
  } catch (error) {
    next(error);
  }
});

// Handler de erro: sempre por último, depois de todas as rotas
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  // 23505 = violação de UNIQUE no PostgreSQL (id ou CNPJ repetido)
  if (error.code === "23505") {
    return res.status(409).json({ erro: "Empresa já cadastrada (id ou CNPJ repetido)." });
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