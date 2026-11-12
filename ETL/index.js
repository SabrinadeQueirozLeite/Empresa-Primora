import { extrairEmpresas } from "./extract.js"
import { transformarEmpresa } from "./transform.js"
import { carregarEmpresas } from "./load.js"

async function executarETL() {
    try{
        console.log("Iniciando processo ETL...")
    
        // EXTRACT 
        const dadosBrutos = await extrairEmpresas()

        // TRANSFORM 
        const dadosTratados = dadosBrutos.map(transformarEmpresa)

        // LOAD
        await carregarEmpresas(dadosTratados)

        console.log("Processo ETL finalizado com sucesso!")
    } 
    
    catch (erro) {
        console.error("Error no processo ETL:", erro.message)
    }
}

executarETL()