import "dotenv/config";

import { extrairDados } from "./extract.js";
import { transformarDados } from "./transform.js";
import { carregarDados } from "./load.js";
import { enriquecerEndereco } from "./enrich.js";

async function executarETL() {
    try {
        console.log("Iniciando processo ETL...");

        // EXTRACT
        const dadosBrutos = await extrairDados();

        // TRANSFORM
        const dadosTratados = dadosBrutos.map(transformarDados);

        // ENRICH
        for (const dados of dadosTratados) {
            dados.endereco = await enriquecerEndereco(
                dados.endereco
            );
        }

        // LOAD
       for(const dados of dadosTratados) { 
        await carregarDados(dados)}

        console.log("Processo ETL finalizado com sucesso!");

    } catch (erro) {
        console.error("Erro no processo ETL:", erro.message);
    }
}

executarETL();