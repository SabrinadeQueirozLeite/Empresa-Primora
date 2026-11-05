//Para ler o arquivo cvs ultilizamos csv-parser
// execute este comando : npm install csv-parser

const fs = require('fs');
const csv = require('csv-parser');

const linhasExtraidas = [];

fs.createReadStream('cliente_distribuidora_vetor.csv')
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
    // Exemplo de como acessar o primeiro item:
     console.log(linhasExtraidas[0].razao_social);
  });
