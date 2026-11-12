// Para ler o arquivo CSV utilizamos o csv-parser
// Execute este comando: npm install csv-parser

import fs from 'fs';
import csv from 'csv-parser';

export function extrairEmpresas() {
  return new Promise((resolve, reject) => {
    const linhasExtraidas = [];

fs.createReadStream('data/clientes_distribuidora_vetor.csv')
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
    resolve(linhasExtraidas);
})
.on("error",(erro)=>{
  reject(erro)
});
});
 }
 
