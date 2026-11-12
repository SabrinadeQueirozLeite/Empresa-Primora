// Transformação
// Exportando a função para poder usar em outro arquivo
 export function transformarEmpresa(dadosBrutos){

        //1. Normalização das Strings (Sem espaços e aqui fica tudo em maiúsculo).
        let razao_social = 'Não Informado'; //Sem valor vai automático para o não informado.
        if (dadosBrutos.razao_social) {
            razao_social = dadosBrutos.razao_social.trim().toUpperCase();
        };

        //Normalização do Email (Sem espaços e tudo minúsculo, para evitar repetições).
        let email = null;
        if (dadosBrutos.email){
            email = dadosBrutos.email.trim().toLowerCase();
        };

        //Normalização das Datas (Aqui está no padrão ISO).
        let data_cadastro;
        if (dadosBrutos.data_cadastro){
            data_cadastro = new Date(dadosBrutos.data_cadastro).toISOString(); //se existir transfroma
        } else {
            data_cadastro = new Date().toISOString(); //se não existir, utiliza a data atual
        };

        //Limpando o CNPJ e os Telefones
        let cnpjLimpo = null;
        if (dadosBrutos.cnpj) {
            cnpjLimpo = dadosBrutos.cnpj.replace(/\D/g, '');
        };

        //Retornando os dados já tratados:
        return{
             id_empresa: dadosBrutos.id_empresa, //Aqui traz o id já definido e não altera.
             razao_social: razao_social,
             email: email,
             data_cadastro: data_cadastro,
             cnpjLimpo: cnpjLimpo,
        };
}



