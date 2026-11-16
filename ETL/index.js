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
