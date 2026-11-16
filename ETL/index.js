import "dotenv/config";

import { extrairEmpresas } from "./extract.js";
import { transformarEmpresa } from "./transform.js";
import { enriquecerEndereco, salvarCache } from "./viacep.js";
import { carregarEmpresas, fecharConexao } from "./load.js";

async function executarETL() {
    try {
        console.log("Iniciando processo ETL...");

        // EXTRACT
        const dadosBrutos = await extrairEmpresas();

        // TRANSFORM
        const dadosTratados = dadosBrutos.map(transformarEmpresa);

        // ENRICH (ViaCEP): um de cada vez, para não sobrecarregar a API
        for (const empresa of dadosTratados) {
            await enriquecerEndereco(empresa);
        }
        salvarCache();

        // LOAD
        const { carregadas, falhas } = await carregarEmpresas(dadosTratados);

        console.log(`Resumo: ${carregadas} empresas carregadas, ${falhas.length} com falha.`);

        if (falhas.length > 0) {
            process.exitCode = 1;
            console.error("Empresas com falha:", falhas);
        } else {
            console.log("Processo ETL finalizado com sucesso!");
        }
    } catch (erro) {
        console.error("Erro no processo ETL:", erro.message);
        process.exitCode = 1;
    } finally {
        await fecharConexao();
    }
}

executarETL();