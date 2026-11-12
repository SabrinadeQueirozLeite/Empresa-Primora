
export function transformarEmpresa(dadosBrutos) {

    // 1. Normalização da razão social
    let razao_social = 'Não Informado';

    if (dadosBrutos.razao_social) {
        razao_social = dadosBrutos.razao_social.trim().toUpperCase();
    }

    // 2. Normalização do email
    let email = null;

    if (dadosBrutos.email) {
        email = dadosBrutos.email.trim().toLowerCase();
    }

    // 3. Normalização da data de cadastro
    let data_cadastro;

    if (dadosBrutos.data_cadastro) {
        let data = new Date(dadosBrutos.data_cadastro);

        if (!isNaN(data.getTime())) {
            data_cadastro = data.toISOString();
        } else {
            data_cadastro = null;
        }

    } else {
        data_cadastro = new Date().toISOString();
    }

    // 4. Limpeza do CNPJ
    let cnpj = null;

    if (dadosBrutos.cnpj) {
        cnpj = dadosBrutos.cnpj.replace(/\D/g, '');
    }

    // 5. Retornando os dados tratados
    return {
        id_empresa: dadosBrutos.id_empresa,
        razao_social: razao_social,
        email: email,
        data_cadastro: data_cadastro,
        cnpj: cnpj
    };
}
