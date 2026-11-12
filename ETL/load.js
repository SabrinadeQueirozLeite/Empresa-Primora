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

export async function carregarClientes(clientes) {
    const conexao = await pool.connect();

    try {
        await conexao.query("BEGIN");

        console.log("Iniciando carregamento dos clientes...");

        for (const cliente of clientes) {

            // 1. Inserir ou atualizar o cliente
            await conexao.query(
                `INSERT INTO cliente (
                    id_cliente,
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
                    String(cliente.id),
                    cliente.nomeCompleto,
                    cliente.email,
                    cliente.dataCadastro
                        ? cliente.dataCadastro.substring(0, 10)
                        : null,
                    cliente.cnpjLimpo,
                    cliente.ativo
                ]
            );

            // 2. Inserir ou atualizar o telefone
            if (cliente.telefoneLimpo) {

                await conexao.query(
                    `INSERT INTO telefone (
                        id_cliente,
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
