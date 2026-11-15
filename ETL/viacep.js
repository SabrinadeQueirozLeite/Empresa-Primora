export async function consultarViaCep(cep) {
    try {
        const resposta = await fetch(
            `https://viacep.com.br/ws/${cep}/json/`
        );

        const dados = await resposta.json();

        // Verifica se o CEP não foi encontrado
        if (dados.erro) {
            return null;
        }

        return {
            logradouro: dados.logradouro || null,
            complemento: dados.complemento || null,
            bairro: dados.bairro || null,
            cidade: dados.localidade || null,
            uf: dados.uf || null
        };

    } catch (erro) {
        console.error(
            `Erro ao consultar o ViaCEP: ${erro.message}`
        );

        return null;
    }
}