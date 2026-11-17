import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

// Colunas DATE (OID 1082) voltam como texto "AAAA-MM-DD", sem virar objeto Date
// (evita a data aparecer como 2025-01-28T03:00:00.000Z no fuso de Brasília)
pg.types.setTypeParser(1082, (valor) => valor);

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
async function selecionarEmpresas() {
    const { rows } = await pool.query(
        `SELECT e.*, v.nome AS vendedor,
                en.cep, en.bairro, en.cidade, en.uf
         FROM empresa e
         LEFT JOIN vendedor v ON v.id_vendedor = e.id_vendedor
         LEFT JOIN endereco en ON en.id_empresa = e.id_empresa
         ORDER BY e.id_empresa`
    );
    return rows;
}

// Insere uma empresa (e o endereço, se vier no corpo) e devolve o registro criado
async function adicionarEmpresa(empresa) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const { rows } = await client.query(
            `INSERT INTO empresa (
                id_empresa, cnpj, razao_social, email, data_cadastro, id_vendedor
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                empresa.id_empresa,
                empresa.cnpj,
                empresa.razao_social,
                empresa.email ?? null,
                empresa.data_cadastro ?? null,
                empresa.id_vendedor ?? null,
            ]
        );

        const temEndereco =
            empresa.cep || empresa.logradouro || empresa.bairro || empresa.cidade || empresa.uf;

        if (temEndereco) {
            await client.query(
                `INSERT INTO endereco (
                    id_empresa, cep, logradouro, complemento, bairro, cidade, uf
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    empresa.id_empresa,
                    empresa.cep ?? null,
                    empresa.logradouro ?? null,
                    empresa.complemento ?? null,
                    empresa.bairro ?? null,
                    empresa.cidade ?? null,
                    empresa.uf ?? null,
                ]
            );
        }

        await client.query("COMMIT");
        return rows[0];
    } catch (erro) {
        await client.query("ROLLBACK");
        throw erro;
    } finally {
        client.release();
    }
}

// Lista todos os telefones
async function selecionarTelefone() {
    const { rows } = await pool.query("SELECT * FROM telefone");
    return rows;
}

// Uma empresa com vendedor, endereço e telefones
async function selecionarEmpresaPorId(id) {
    const { rows } = await pool.query(
        `SELECT e.*,
                v.nome AS vendedor,
                en.cep, en.logradouro, en.complemento, en.bairro, en.cidade, en.uf,
                COALESCE(
                    jsonb_agg(
                        jsonb_build_object('ddd', t.ddd, 'numero', t.numero, 'tipo', t.tipo)
                    ) FILTER (WHERE t.id_telefone IS NOT NULL),
                    '[]'
                ) AS telefones
         FROM empresa e
         LEFT JOIN vendedor v ON v.id_vendedor = e.id_vendedor
         LEFT JOIN endereco en ON en.id_empresa = e.id_empresa
         LEFT JOIN telefone t ON t.id_empresa = e.id_empresa
         WHERE e.id_empresa = $1
         GROUP BY e.id_empresa, v.id_vendedor, en.id_endereco`,
        [id]
    );
    return rows[0] ?? null;
}

// Por que esta empresa ficou assim? (original -> tratado -> critério -> fonte)
async function selecionarAuditoria(id) {
    const { rows } = await pool.query(
        `SELECT campo, valor_original, valor_tratado, criterio, fonte
         FROM auditoria
         WHERE id_empresa = $1
         ORDER BY id_auditoria`,
        [id]
    );
    return rows;
}

// Relatório agregado: quantas empresas por bairro, e quais grafias foram
// unificadas em cada um (vem da auditoria: bairro, regra local ou dicionário)
async function contarEmpresasPorBairro() {
    const { rows } = await pool.query(
        `SELECT COALESCE(en.bairro, '(sem bairro)') AS bairro,
                COUNT(*)::int AS total,
                COALESCE((
                    SELECT jsonb_agg(
                               jsonb_build_object('texto', g.valor_original, 'total', g.n)
                               ORDER BY g.n DESC, g.valor_original
                           )
                    FROM (
                        SELECT a.valor_original, COUNT(*)::int AS n
                        FROM auditoria a
                        WHERE a.campo = 'bairro'
                          AND a.fonte IN ('regra local', 'dicionário')
                          AND a.valor_original IS NOT NULL
                          AND a.valor_tratado = en.bairro
                        GROUP BY a.valor_original
                    ) g
                ), '[]'::jsonb) AS grafias
         FROM endereco en
         GROUP BY en.bairro
         ORDER BY total DESC, bairro`
    );
    return rows;
}

// Relatório de auditoria: quantos ajustes por campo e por fonte
async function contarAjustes() {
    const { rows } = await pool.query(
        `SELECT campo, fonte, COUNT(*)::int AS total
         FROM auditoria
         GROUP BY campo, fonte
         ORDER BY campo, fonte`
    );
    return rows;
}

async function atualizarEmpresa(id, empresa) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const { rows } = await client.query(
            `UPDATE empresa
             SET cnpj = COALESCE($1, cnpj),
                 razao_social = COALESCE($2, razao_social),
                 email = COALESCE($3, email),
                 id_vendedor = COALESCE($4, id_vendedor)
             WHERE id_empresa = $5
             RETURNING *`,
            [
                empresa.cnpj ?? null,
                empresa.razao_social ?? null,
                empresa.email ?? null,
                empresa.id_vendedor ?? null,
                id
            ]
        );

        if (rows.length === 0) {
            await client.query("ROLLBACK");
            return null;
        }

        await client.query("COMMIT");

        return rows[0];

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function excluirEmpresa(id) {
    const { rows } = await pool.query(
        `DELETE FROM empresa
         WHERE id_empresa = $1
         RETURNING *`,
        [id]
    );

    return rows[0] ?? null;

    async function selecionarUsuarioPorEmail(email) {
        const{rows}=  await pool.query(
            `SELECT id_usuario, nome, email, senha_hash, perfil from usuarios
            where email =$1`,
            [email]
        );
        return rows [0] ?? null;
    }
}

export default {
    pool,
    verificarConexao,
    encerrarConexao,
    selecionarEmpresas,
    adicionarEmpresa,
    selecionarTelefone,
    selecionarEmpresaPorId,
    selecionarAuditoria,
    contarEmpresasPorBairro,
    contarAjustes,
    atualizarEmpresa,
    excluirEmpresa,
    selecionarUsuarioPorEmail,

};