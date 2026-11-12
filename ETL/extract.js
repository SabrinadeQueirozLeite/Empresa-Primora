// Para ler o arquivo CSV utilizamos o csv-parser
// Execute este comando: npm install csv-parser

import fs from 'fs';
import csv from 'csv-parser';

export function extrairEmpresas() {
  return new Promise((resolve, reject) => {
    const linhasExtraidas = [];

    console.log('--- INICIANDO A LEITURA DO ARQUIVO CSV ---');

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

        // Envia os dados para quem chamou a função
        resolve(linhasExtraidas);
      })
      .on('error', (erro) => {
        reject(erro);
      });
  });
}