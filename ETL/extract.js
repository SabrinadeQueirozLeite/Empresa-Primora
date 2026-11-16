import fs from "node:fs";
import { pipeline } from "node:stream/promises";
import csv from "csv-parser";
import { fileURLToPath } from "node:url";

const csvPath = fileURLToPath(
  new URL("./data/clientes_distribuidora_vetor.csv", import.meta.url),
);

<<<<<<< HEAD
export async function extrairEmpresas() {
=======
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const caminhoArquivo = path.join(
__dirname,
"data",
"clientes_distribuidora_vetor.csv"
);

export function extrairDados() {
  return new Promise((resolve, reject) => {
>>>>>>> 05b554ba462cd4848ee9ae725fbd936ea2c8cc67
  const linhasExtraidas = [];
  const parser = csv({ separator: ";" });
  parser.on("data", (linha) => linhasExtraidas.push(linha));

<<<<<<< HEAD
  await pipeline(fs.createReadStream(csvPath), parser);
  console.log(`${linhasExtraidas.length} linhas extraídas do CSV.`);

  return linhasExtraidas;
}
=======
   fs.createReadStream(caminhoArquivo)
    .pipe(csv({
      separator: ';' 
    }))
    .on('data', (row) => {
      // Cada 'row' é uma linha do CSV convertida em objeto automaticamente
      linhasExtraidas.push(row);
    })
    .on('end', () => {
      console.log('--- EXTRAÇÃO CONCLUÍDA ---');
      // Aqui dentro você já tem acesso a todos os dados.
      //Você dá um console.log  do campo que quiser vizualizar  
      resolve(linhasExtraidas);
  })
  .on("error",(erro)=>{
    reject(erro)
});
});
 }
 
>>>>>>> 05b554ba462cd4848ee9ae725fbd936ea2c8cc67
