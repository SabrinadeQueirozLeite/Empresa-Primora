export async function enriquecerEndereco(endereco) {

    // Verifica se existe um CEP
    if (!endereco.cep) {
        return {
            ...endereco,
            logradouro: null,
            complemento: null,
            bairro: null,
            cidade: null,
            uf: null
        };
    }

    try {
        // Consulta a API ViaCEP
        const resposta = await fetch(
            `https://viacep.com.br/ws/${endereco.cep}/json/`
        );

        const dadosViaCep = await resposta.json();

        // Verifica se o CEP existe
        if (dadosViaCep.erro) {
            console.log(`CEP não encontrado: ${endereco.cep}`);

            return {
                ...endereco,
                logradouro: null,
                complemento: null,
                bairro: endereco.bairro_informado,
                cidade: null,
                uf: null
            };
        }

        // Retorna o endereço enriquecido
        return {
            ...endereco,
            logradouro: dadosViaCep.logradouro || null,
            complemento: dadosViaCep.complemento || null,
            bairro: dadosViaCep.bairro || endereco.bairro_informado,
            cidade: dadosViaCep.localidade || null,
            uf: dadosViaCep.uf || null
        };

    } catch (erro) {

        console.error(
            `Erro ao consultar o CEP ${endereco.cep}: ${erro.message}`
        );

        return {
            ...endereco,
            logradouro: null,
            complemento: null,
            bairro: endereco.bairro_informado,
            cidade: null,
            uf: null
        };
    }
}