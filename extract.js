async function lerCSVPorUrl(clientes_distribuidora_vetor.csv) {
  const resposta = await fetch(clientes_distribuidora_vetor.csv);
  const texto = await resposta.text();
  
  // Divide o texto em linhas
  const linhas = texto.split('\n');
  const cabecalho = linhas[0].split(',');

  const dados = linhas.slice(1).map(linha => {
    const valores = linha.split(',');
    let objeto = {};
    cabecalho.forEach((coluna, index) => {
      objeto[coluna.trim()] = valores[index]?.trim();
    });
    return objeto;
  });

  console.log(dados);
}

lerCSVPorUrl('/clientes_distribuidora_vetor.csv');