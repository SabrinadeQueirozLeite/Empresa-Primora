//Transformação
function transformarEmpresa(dadosBrutos){

        //1. Normalização das Strings(Sem espaços e aqui fica tudo em minúsculo).
        let nomeCompleto = 'Não Informado'; //Sem valor vai automático para o não informado.
        if (dadosBrutos.name) {
            nomeCompleto = dadosBrutos.name.trim().toLowerCase();
        };

        //Normalização do Email(Sem espaços e tudo minúsculo, para evitar repetições).
        let email = null;
        if (dadosBrutos.email){
            email = dadosBrutos.email.trim().toLowerCase();
        };

        //Normalização das Datas (Aqui está no padrão ISO).
        let dataCadastro;
        if (dadosBrutos.created_at){
            dataCadastro = new Date(dadosBrutos.created_at).toISOString(); //se existir transfroma
        } else {
            dataCadastro = new Date().toISOString(); //se não existir, utiliza a data atual
        };

        //Limpando o CNPJ e os Telefones
        let cnpjLimpo = null;
        if (dadosBrutos.cnpj) {
            cnpjLimpo = dadosBrutos.cnpj.replace(/\D/g, '');
        };

        let telefoneLimpo = null;
        if(dadosBrutos.phone) {
            telefoneLimpo = dadosBrutos.phone.replace(/\D/g, '');
        };

        //Retornando os dados já tratados:
        return{
             id: dadosBrutos.id, //Aqui traz o id já definido e não altera.
             nomeCompleto: nomeCompleto,
             email: email,
             dataCadastro: dataCadastro,
             cnpjLimpo: cnpjLimpo,
             telefoneLimpo: telefoneLimpo,
             ativo: dadosBrutos.status === 1 || dadosBrutos.status === 'active'
        };
}

// Exportando a função para poder usar em outro arquivo
module.exports = transformarEmpresas;
