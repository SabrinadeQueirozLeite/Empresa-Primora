<<<<<<< HEAD
import { extrairEmpresas } from "./extract.js";
import { carregarEmpresas, encerrarConexao } from "./load.js";
import { transformarEmpresa } from "./transform.js";

async function executarETL() {
  try {
    console.log("Iniciando processo ETL...");
    const dadosBrutos = await extrairEmpresas();
    const dadosTratados = dadosBrutos.map(transformarEmpresa);
    await carregarEmpresas(dadosTratados);
    console.log("Processo ETL finalizado com sucesso.");
  } catch (erro) {
    console.error("Erro no processo ETL:", erro);
    process.exitCode = 1;
  } finally {
    await encerrarConexao();
  }
}

await executarETL();
=======
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
>>>>>>> 05b554ba462cd4848ee9ae725fbd936ea2c8cc67
