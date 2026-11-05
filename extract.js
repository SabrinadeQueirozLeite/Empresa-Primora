//Para ler o arquivo cvs ultilizamos csv-parser
// execute este comando : npm install csv-parser

import fs from 'fs';
import csv from 'csv-parser';

const linhasExtraidas = [];
console.log("---Iniciando a leitura do arquivo CSV---");

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
    console.log(linhasExtraidas);

    // Aqui dentro você já tem acesso a todos os dados. 
  });
