// EXTRACT: lê o CSV da Distribuidora Vetor (separador ";") e devolve as linhas cruas.
// Instalar a dependência: npm install csv-parser

import fs from "fs";
import csv from "csv-parser";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const caminhoArquivo = path.join(__dirname, "data", "clientes_distribuidora_vetor.csv");

export function extrairEmpresas() {
    return new Promise((resolve, reject) => {
        const linhasExtraidas = [];

        fs.createReadStream(caminhoArquivo)
            .pipe(csv({ separator: ";" }))
            .on("data", (linha) => {
                // Cada linha do CSV vira um objeto com os nomes das colunas
                linhasExtraidas.push(linha);
            })
            .on("end", () => {
                console.log(`--- EXTRAÇÃO CONCLUÍDA: ${linhasExtraidas.length} linhas ---`);
                resolve(linhasExtraidas);
            })
            .on("error", (erro) => reject(erro));
    });
}