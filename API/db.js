import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const requiredVariables = [
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
    "DB_HOST",
    "DB_PORT",
];

const missingVariables = requiredVariables.filter(
    (variable) => !process.env[variable]
);

if (missingVariables.length > 0) {
    throw new Error(
        `Variáveis ausentes no .env: ${missingVariables.join(", ")}`
    );
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
        error
    );
});

// Testa se o banco está acessível
async function verificarConexao() {
    const client = await pool.connect();
    try {
        await client.query("SELECT 1");
    } finally {
        client.release();
    }
}

// Fecha todas as conexões do pool
async function encerrarConexao() {
    await pool.end();
}

// Lista todas as empresas
async function selecionarempresa() {
    const { rows } = await pool.query("SELECT * FROM empresa");
    return rows;
}

// Insere uma empresa e retorna o registro criado
// AJUSTE as colunas conforme a sua tabela
async function adicionarempresa({ nome, cnpj }) {
    const { rows } = await pool.query(
        "INSERT INTO empresa (nome, cnpj) VALUES ($1, $2) RETURNING *",
        [nome, cnpj]
    );
    return rows[0];
}

// Lista todos os telefones
async function selecionarTelefone() {
    const { rows } = await pool.query("SELECT * FROM telefone");
    return rows;
}

export default {
    pool,
    verificarConexao,
    encerrarConexao,
    selecionarempresa,
    adicionarempresa,
    selecionarTelefone,
};