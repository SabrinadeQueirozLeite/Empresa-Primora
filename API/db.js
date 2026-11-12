const { Pool } = require("pg");

const requiredVariables = [
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "DB_HOST",
  "DB_PORT",
];
const missingVariables = requiredVariables.filter(
  (variable) => !process.env[variable],
);

if (missingVariables.length > 0) {
  throw new Error(`Variáveis ausentes no .env: ${missingVariables.join(", ")}`);
}

const databasePort = Number(process.env.DB_PORT);
if (
  !Number.isInteger(databasePort) ||
  databasePort < 1 ||
  databasePort > 65535
) {
  throw new Error("DB_PORT deve ser uma porta válida.");
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: databasePort,
});

pool.on("error", (error) => {
  console.error(
    "Erro inesperado em uma conexão ociosa com o PostgreSQL:",
    error,
  );
});

async function verificarConexao() {
  await pool.query("SELECT 1");
}

async function selecionarempresa() {
  const result = await pool.query("SELECT * FROM empresa");
  return result.rows;
}

async function adicionarEmpresa(empresa) {
  const result = await pool.query(
    "INSERT INTO empresa (id_empresa, cnpj, razao_social, email, cep, bairro, cidade, uf, data_cadastro, id_vendedor) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
    [
      empresa.id_cliente,
      empresa.cnpj,
      empresa.razao_social,
      empresa.email,
      empresa.cep,
      empresa.bairro,
      empresa.cidade,
      empresa.uf,
      empresa.data_cadastro,
      empresa.id_vendedor,
    ],
  );

  return result.rows[0];
}

async function selecionarTelefone() {
  const result = await pool.query("SELECT * FROM telefone");
  return result.rows;
}

async function encerrarConexao() {
  await pool.end();
}

module.exports = {
  adicionarempresa,
  encerrarConexao,
  selecionarempresa,
  selecionarTelefone,
  verificarConexao,
};
