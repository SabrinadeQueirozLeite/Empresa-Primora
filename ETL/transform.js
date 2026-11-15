// TRANSFORMA EMPRESA
export function transformarEmpresa(dadosBrutos) {
     // 1. Limpeza do CNPJ
    let cnpj = null;

    if (dadosBrutos.cnpj) {
        cnpj = dadosBrutos.cnpj.replace(/\D/g, "");
    }

    // 2. Normalização da razão social
    let razao_social = 'Não Informado';

    if (dadosBrutos.razao_social) {
        razao_social = dadosBrutos.razao_social.trim().toUpperCase();
    }

    // 3. Normalização do email
    let email = null;

    if (dadosBrutos.email) {
        email = dadosBrutos.email.trim().toLowerCase();
    }

    // 4. Normalização da data de cadastro
    let data_cadastro = null;

    if (dadosBrutos.data_cadastro) {
        const dataOriginal = dadosBrutos.data_cadastro.trim();

        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataOriginal)) {
            const [dia, mes, ano] = dataOriginal.split("/");

            data_cadastro = new Date(
            `${ano}-${mes}-${dia}T00:00:00`
             ).toISOString();
        } else {
            const data = new Date(dataOriginal);

            if (!isNaN(data.getTime())) {
            data_cadastro = data.toISOString();
            }
        }
}

    // 5. Retornando os dados tratados
    return {
        id_empresa: dadosBrutos.id_cliente,
        razao_social: razao_social,
        email: email,
        data_cadastro: data_cadastro,
        cnpj: cnpj
    };
}

// TRANSFORMA TELEFONE
export function transformarTelefone(dadosBrutos) {
    let ddd = null;
    let numero = null;
    let tipo = null;

    if (dadosBrutos.telefone) {
        const telefoneLimpo = dadosBrutos.telefone.replace(/\D/g, "");

        if (telefoneLimpo.length >= 10) {
            ddd = telefoneLimpo.substring(0, 2);
            numero = telefoneLimpo.substring(2);

            if (numero.length === 9) {
                tipo = "CELULAR";
            } else if (numero.length === 8) {
                tipo = "FIXO";
            }
        }
    }

    return {
        ddd,
        numero,
        tipo
    };
}

// TRANSFORMA ENDEREÇO
export function transformarEndereco(dadosBrutos) {
    let cep = null;
    let bairro_informado = null;

    if (dadosBrutos.cep) {
        cep = dadosBrutos.cep.replace(/\D/g, "");

        if (cep.length !== 8) {
            cep = null;
        }
    }

    if (dadosBrutos.bairro_informado) {
        bairro_informado = dadosBrutos.bairro_informado.trim().toUpperCase();
    }

    return {
        cep,
        bairro_informado
    };
}

// TRANSFORMA VENDEDOR
export function transformarVendedor(dadosBrutos) {
    let nome = "Não Informado";

    if (dadosBrutos.vendedor_responsavel) {
        nome = dadosBrutos.vendedor_responsavel.trim().toUpperCase();
    }

    return {
        nome
    };
}

// CRIA AUDITORIA
export function criarAuditoria(
    campo,
    valor_original,
    valor_tratado,
    criterio,
    fonte = "CSV"
) {
    return {
        campo,
        valor_original,
        valor_tratado,
        criterio,
        fonte
    };
}

// TRANSFORMA TODOS OS DADOS
export function transformarDados(dadosBrutos) {
    // Executa cada transformação
        const empresa = transformarEmpresa(dadosBrutos)
        const telefone = transformarTelefone(dadosBrutos)
        const endereco = transformarEndereco(dadosBrutos)
        const vendedor = transformarVendedor(dadosBrutos)

        // Lista que armazenará as alterações
        const auditorias = []

     // AUDITORIA DA RAZÃO SOCIAL
    if (
        dadosBrutos.razao_social &&
        dadosBrutos.razao_social !== empresa.razao_social
    ) {
        auditorias.push(
            criarAuditoria(
                "razao_social",
                dadosBrutos.razao_social,
                empresa.razao_social,
                "Normalização"
            )
        );
    }
     // AUDITORIA DO EMAIL
    if (
        dadosBrutos.email &&
        dadosBrutos.email !== empresa.email
    ) {
        auditorias.push(
            criarAuditoria(
                "email",
                dadosBrutos.email,
                empresa.email,
                "Normalização"
            )
        );
    }
     // AUDITORIA DO CNPJ
    if (
        dadosBrutos.cnpj &&
        dadosBrutos.cnpj !== empresa.cnpj
    ) {
        auditorias.push(
            criarAuditoria(
                "cnpj",
                dadosBrutos.cnpj,
                empresa.cnpj,
                "Remoção de caracteres especiais"
            )
        );
    }
    // AUDITORIA DO CEP
    if (
        dadosBrutos.cep &&
        dadosBrutos.cep.replace(/\D/g, "") !== endereco.cep
    ) {
        auditorias.push(
            criarAuditoria(
                "cep",
                dadosBrutos.cep,
                endereco.cep,
                "Padronização do CEP"
            )
        );
    }
    // Retorna tudo que foi processado
    return {
        empresa,
        telefone,
        endereco,
        vendedor,
        auditorias
    };
}  


