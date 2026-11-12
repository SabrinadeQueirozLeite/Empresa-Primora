import { extrairClientes } from "./extract"
import { transformarClientes } from "./transform"
import { carregarClientes } from "./load"

async function executarETL() {
    try{
        console.log("Iniciando processo ETL...")
    
        // EXTRACT 
        const dadosBrutos = await extrairClientes()

        // TRANSFORM 
        const dadosTratados = transformarClientes(dadosBrutos)

        // LOAD
        await carregarClientes(dadosTratados)

        console.log("Processo ETL finalizado com sucesso!")
    } 
    
    catch (erro) {
        console.error("Error no processo ETL:", erro.message)
    }
}

executarETL()