import pool from "../API/db.js";

export async function carregarDados(dados) {
    console.log("Carregando empresa:", dados.empresa.razao_social);
    console.log("Telefone:", dados.telefone);
    
    const cliente = await pool.connect();

    try {
        // Inicia uma transação
        await cliente.query("BEGIN");


        // 1. SALVA O VENDEDOR
        const resultadoVendedor = await cliente.query(
            `
            INSERT INTO vendedor (nome)
            VALUES ($1)
            RETURNING id_vendedor
            `,
            [dados.vendedor.nome]
        );

        const idVendedor =
            resultadoVendedor.rows[0].id_vendedor;


        // 2. SALVA A EMPRESA
        const resultadoEmpresa = await cliente.query(
            `
            INSERT INTO empresa (
                id_empresa,
                cnpj,
                razao_social,
                email,
                data_cadastro,
                id_vendedor
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id_empresa
            `,
            [
                dados.empresa.id_empresa,
                dados.empresa.cnpj,
                dados.empresa.razao_social,
                dados.empresa.email,
                dados.empresa.data_cadastro,
                idVendedor
            ]
        );

        const idEmpresa =
            resultadoEmpresa.rows[0].id_empresa;


        // 3. SALVA O TELEFONE
        if (dados.telefone.numero) {

            await cliente.query(
                `
                INSERT INTO telefone (
                    id_empresa,
                    ddd,
                    numero,
                    tipo
                )
                VALUES ($1, $2, $3, $4)
                `,
                [
                    idEmpresa,
                    dados.telefone.ddd,
                    dados.telefone.numero,
                    dados.telefone.tipo
                ]
            );
        }


        // 4. SALVA O ENDEREÇO
        if (dados.endereco.cep) {

            await cliente.query(
                `
                INSERT INTO endereco (
                    cep,
                    logradouro,
                    complemento,
                    bairro_informado,
                    cidade,
                    uf,
                    id_empresa
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                `,
                [
                    dados.endereco.cep,
                    dados.endereco.logradouro,
                    dados.endereco.complemento,
                    dados.endereco.bairro_informado,
                    dados.endereco.cidade,
                    dados.endereco.uf,
                    idEmpresa
                ]
            );
        }


        // 5. SALVA AS AUDITORIAS
        for (const auditoria of dados.auditorias) {

            await cliente.query(
                `
                INSERT INTO auditoria (
                    id_empresa,
                    campo,
                    valor_original,
                    valor_tratado,
                    criterio,
                    fonte
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                `,
                [
                    idEmpresa,
                    auditoria.campo,
                    auditoria.valor_original,
                    auditoria.valor_tratado,
                    auditoria.criterio,
                    auditoria.fonte
                ]
            );
        }


        // Confirma todas as inserções
        await cliente.query("COMMIT");

        console.log(
            `Empresa ${dados.empresa.razao_social} carregada com sucesso!`
        );

    } catch (erro) {

        // Desfaz tudo se ocorrer algum erro
        await cliente.query("ROLLBACK");

        console.error(
            "Erro ao carregar os dados:",
            erro.message
        );

        throw erro;

    } finally {

        // Libera a conexão
        cliente.release();
    }
}