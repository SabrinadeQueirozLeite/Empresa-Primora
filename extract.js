const fs = require('fs');
const csv = require('csv-parser');

const resultados = [];

fs.createReadStream('cliente_distribuidora_vetor.csv')
  .pipe(csv())
  .on('data', (cliente_distribuidora_vetor) => resultados.push(cliente_distribuidora_vetor))
  .on('end', () => {
    console.log('CSV processado com sucesso:', resultados);
  });
