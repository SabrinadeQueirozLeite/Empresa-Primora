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

        for (const empresa of empresas) {
            const id_empresa = String(empresa.id);

            // 1. Empresa
            await conexao.query(
                `INSERT INTO empresa(
                    id_empresa, razao_social, email,
                    data_cadastro, cnpj, ativo
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (id_empresa)
                DO UPDATE SET
                    razao_social = EXCLUDED.razao_social,
                    email = EXCLUDED.email,
                    data_cadastro = EXCLUDED.data_cadastro,
                    cnpj = EXCLUDED.cnpj,
                    ativo = EXCLUDED.ativo`,
                [
                    id_empresa,
                    empresa.nomeCompleto,
                    empresa.email,
                    empresa.dataCadastro
                        ? empresa.dataCadastro.substring(0, 10)
                        : null,
                    empresa.cnpjLimpo,
                    empresa.ativo
                ]
            );

            // 2. Telefone (1 empresa : N telefones)
            await conexao.query(
                `DELETE FROM telefone WHERE id_empresa = $1`,
                [id_empresa]
            );

            if (empresa.telefoneNumero) {
                await conexao.query(
                    `INSERT INTO telefone (id_empresa, ddd, numero, tipo)
                    VALUES ($1, $2, $3, $4)`,
                    [
                        id_empresa,
                        empresa.telefoneDdd,
                        empresa.telefoneNumero,
                        empresa.telefoneTipo
                    ]
                );
            }

            // 3. Endereço tratado (1 empresa : 1 endereço)
            if (empresa.cepLimpo || empresa.bairroTratado) {
                await conexao.query(
                    `INSERT INTO endereco (
                        id_empresa, cep, logradouro, bairro, cidade, uf
                    )
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (id_empresa)
                    DO UPDATE SET
                        cep = EXCLUDED.cep,
                        logradouro = EXCLUDED.logradouro,
                        bairro = EXCLUDED.bairro,
                        cidade = EXCLUDED.cidade,
                        uf = EXCLUDED.uf`,
                    [
                        id_empresa,
                        empresa.cepLimpo,
                        empresa.logradouro,
                        empresa.bairroTratado,
                        empresa.cidade,
                        empresa.uf
                    ]
                );
            }

            // 4. Auditoria (1 empresa : N registros)
            // Apaga o log anterior para não duplicar se o pipeline rodar de novo
            await conexao.query(
                `DELETE FROM auditoria WHERE id_empresa = $1`,
                [id_empresa]
            );

            for (const a of empresa.auditoria ?? []) {
                await conexao.query(
                    `INSERT INTO auditoria (
                        id_empresa, campo, valor_original,
                        valor_tratado, criterio, fonte
                    )
                    VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        id_empresa,
                        a.campo,
                        a.valorOriginal,
                        a.valorTratado,
                        a.criterio,
                        a.fonte
                    ]
                );
            }
        }

        await conexao.query("COMMIT");

        console.log(`${empresas.length} empresas carregadas com sucesso!`);

    } catch (erro) {
        await conexao.query("ROLLBACK");
        console.error("Erro ao carregar empresas:", erro.message);
        throw erro;
    } finally {
        conexao.release();
    }
}