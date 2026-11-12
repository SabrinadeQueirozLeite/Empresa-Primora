//Transformação
export function transformarClientes(dadosBrutos){

        //1. Normalização das Strings(Sem espaços e aqui fica tudo em maiúsculo).
        let razaoSocial = 'Não Informado'; //Sem valor vai automático para o não informado.
        if (dadosBrutos.name) {
            razaoSocial = dadosBrutos.name.trim().toUpperCase();
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

        //Limpando o CNPJ e os Telefones (Somente Números)
        let cnpjLimpo = null;
        if (dadosBrutos.cnpj) {
            cnpjLimpo = dadosBrutos.cnpj.replace(/\D/g, ''); // a função ".replace(/\D/g, '')" encontra os caracteres diferentes de números e substitui por um vazio ''.
        };

        let telefoneLimpo = null;
        if(dadosBrutos.phone) {
            telefoneLimpo = dadosBrutos.phone.replace(/\D/g, '');
        };

        //Retornando os dados já tratados:
        return{
             idEmpresa: dadosBrutos.id, //Aqui traz o id já definido e não altera.
             razaoSocial: nomeCompleto,
             email: email,
             dataCadastro: dataCadastro,
             cnpjLimpo: cnpjLimpo,
             telefoneLimpo: telefoneLimpo,
             ativo: dadosBrutos.status === 1 || dadosBrutos.status === 'active'
        };
}
