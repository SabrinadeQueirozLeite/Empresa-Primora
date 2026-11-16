// ======================================================================
// LOAD: grava as empresas tratadas no PostgreSQL.
// Cada empresa é gravada na sua própria transação: se uma linha falhar,
// só ela sofre ROLLBACK, as demais continuam e a falha vai para o resumo.
// Rodar de novo não duplica nada (upsert + delete/insert dos filhos).
// ======================================================================

import db from "../API/db.js";

const { pool } = db;

// Procura o vendedor pelo nome; se não existir, cria. Devolve o id.
async function obterVendedor(cliente, nome) {
    if (!nome) return null;

    const existente = await cliente.query(
        "SELECT id_vendedor FROM vendedor WHERE nome = $1",
        [nome]
    );
    if (existente.rows.length > 0) return existente.rows[0].id_vendedor;

    const novo = await cliente.query(
        "INSERT INTO vendedor (nome) VALUES ($1) RETURNING id_vendedor",
        [nome]
    );
    return novo.rows[0].id_vendedor;
}

async function gravarEmpresa(cliente, empresa) {
    if (!empresa.id_empresa) {
        throw new Error("linha sem id_cliente no CSV");
    }
    const id = empresa.id_empresa;

    // 1. Vendedor (1 vendedor : N empresas)
    const idVendedor = await obterVendedor(cliente, empresa.vendedor);

    // 2. Empresa
    await cliente.query(
        `INSERT INTO empresa (
            id_empresa, cnpj, razao_social, email, data_cadastro, id_vendedor
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id_empresa)
        DO UPDATE SET
            cnpj = EXCLUDED.cnpj,
            razao_social = EXCLUDED.razao_social,
            email = EXCLUDED.email,
            data_cadastro = EXCLUDED.data_cadastro,
            id_vendedor = EXCLUDED.id_vendedor`,
        [
            id,
            empresa.cnpj,
            empresa.razao_social,
            empresa.email,
            empresa.data_cadastro,
            idVendedor,
        ]
    );

    // 3. Telefone (1 empresa : N telefones)
    await cliente.query("DELETE FROM telefone WHERE id_empresa = $1", [id]);

    if (empresa.numero) {
        await cliente.query(
            `INSERT INTO telefone (id_empresa, ddd, numero, tipo)
            VALUES ($1, $2, $3, $4)`,
            [id, empresa.ddd, empresa.numero, empresa.tipo]
        );
    }

    // 4. Endereço tratado (1 empresa : 1 endereço)
    await cliente.query("DELETE FROM endereco WHERE id_empresa = $1", [id]);

    const temEndereco =
        empresa.cep || empresa.logradouro || empresa.bairro || empresa.cidade || empresa.uf;

    if (temEndereco) {
        await cliente.query(
            `INSERT INTO endereco (
                id_empresa, cep, logradouro, complemento, bairro, cidade, uf
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                id,
                empresa.cep,
                empresa.logradouro,
                empresa.complemento,
                empresa.bairro,
                empresa.cidade,
                empresa.uf,
            ]
        );
    }

    // 5. Auditoria (1 empresa : N registros)
    await cliente.query("DELETE FROM auditoria WHERE id_empresa = $1", [id]);

    for (const a of empresa.auditoria ?? []) {
        await cliente.query(
            `INSERT INTO auditoria (
                id_empresa, campo, valor_original, valor_tratado, criterio, fonte
            )
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, a.campo, a.valor_original, a.valor_tratado, a.criterio, a.fonte]
        );
    }
}

export async function carregarEmpresas(empresas) {
    const cliente = await pool.connect();
    let carregadas = 0;
    const falhas = [];

    try {
        console.log("Iniciando carregamento das empresas...");

        for (const empresa of empresas) {
            try {
                await cliente.query("BEGIN");
                await gravarEmpresa(cliente, empresa);
                await cliente.query("COMMIT");
                carregadas++;
            } catch (erro) {
                await cliente.query("ROLLBACK");
                falhas.push({ id_empresa: empresa.id_empresa, erro: erro.message });
                console.error(`Falha ao carregar ${empresa.id_empresa ?? "(sem id)"}: ${erro.message}`);
            }
        }
    } finally {
        cliente.release();
    }

    return { carregadas, falhas };
}

export async function fecharConexao() {
    await db.encerrarConexao();
}