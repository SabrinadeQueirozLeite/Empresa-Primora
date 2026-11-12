import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432
});

export async function carregarempresas(empresas) {
    const conexao = await pool.connect();

    try {
        await conexao.query("BEGIN");

        console.log("Iniciando carregamento dos clientes...");

        for (const empresa of empresa) {

            // 1. Inserir ou atualizar o cliente
            await conexao.query(
                `INSERT INTO empresa(
                    id_empresa,
                    razao_social,
                    email,
                    data_cadastro,
                    cnpj,
                    ativo
                )
                VALUES ($1, $2, $3, $4, $5, $6)

                ON CONFLICT (id_cliente)
                DO UPDATE SET
                    razao_social = EXCLUDED.razao_social,
                    email = EXCLUDED.email,
                    data_cadastro = EXCLUDED.data_cadastro,
                    cnpj = EXCLUDED.cnpj,
                    ativo = EXCLUDED.ativo`,

                [
                    String(empresa.id),
                    empresa.nomeCompleto,
                    empresa.email,
                    empresa.dataCadastro
                        ? empresa.dataCadastro.substring(0, 10)
                        : null,
                    empresa.cnpjLimpo,
                    empresa.ativo
                ]
            );

            // 2. Inserir ou atualizar o telefone
            if (empresa.telefoneLimpo) {

                await conexao.query(
                    `INSERT INTO telefone (
                        id_empresa,
                        numero
                    )
                    VALUES ($1, $2)

                    ON CONFLICT (id_cliente)
                    DO UPDATE SET
                        numero = EXCLUDED.numero`,

                    [
                        String(cliente.id),
                        cliente.telefoneLimpo
                    ]
                );
            }
        }

        await conexao.query("COMMIT");

        console.log(
            `${clientes.length} clientes carregados com sucesso!`
        );

    } catch (erro) {

        await conexao.query("ROLLBACK");

        console.error("Erro ao carregar clientes:", erro.message);

        throw erro;

    } finally {
        conexao.release();
    }
}

export async function fecharConexao() {
    await pool.end();
}
