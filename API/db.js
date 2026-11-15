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

export default pool;