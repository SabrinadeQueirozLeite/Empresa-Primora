function textoOuNulo(valor) {
  const texto = String(valor ?? "").trim();
  return texto || null;
}

function normalizarData(valor) {
  const texto = textoOuNulo(valor);
  if (!texto) {
    return null;
  }

  const partes = texto.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  const data = partes
    ? `${partes[3]}-${partes[2].padStart(2, "0")}-${partes[1].padStart(2, "0")}`
    : texto;
  const correspondencia = data.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!correspondencia) {
    const dataLegivel = new Date(texto);
    return Number.isNaN(dataLegivel.getTime())
      ? null
      : dataLegivel.toISOString().slice(0, 10);
  }

  const [, ano, mes, dia] = correspondencia;
  const dataValidada = new Date(Date.UTC(Number(ano), Number(mes) - 1, Number(dia)));

  if (
    dataValidada.getUTCFullYear() !== Number(ano) ||
    dataValidada.getUTCMonth() !== Number(mes) - 1 ||
    dataValidada.getUTCDate() !== Number(dia)
  ) {
    return null;
  }

  return data;
}

function normalizarTelefone(valor) {
  let digitos = String(valor ?? "").replace(/\D/g, "");
  if (digitos.startsWith("55") && [12, 13].includes(digitos.length)) {
    digitos = digitos.slice(2);
  }

  if (![10, 11].includes(digitos.length)) {
    return null;
  }

  const numero = digitos.slice(2);
  return {
    ddd: digitos.slice(0, 2),
    numero,
    tipo: numero.length === 9 ? "Celular" : "Fixo",
  };
}

export function transformarEmpresa(dadosBrutos) {
  const idEmpresa = textoOuNulo(dadosBrutos.id_cliente);
  const razaoSocial = textoOuNulo(dadosBrutos.razao_social);

  if (!idEmpresa || !razaoSocial) {
    throw new Error("Cada linha do CSV deve conter id_cliente e razao_social.");
  }

  return {
    id_empresa: idEmpresa,
    razao_social: razaoSocial.toUpperCase(),
    email: textoOuNulo(dadosBrutos.email)?.toLowerCase() ?? null,
    data_cadastro: normalizarData(dadosBrutos.data_cadastro),
    cnpj: textoOuNulo(dadosBrutos.cnpj)?.replace(/\D/g, "") ?? null,
    cep: textoOuNulo(dadosBrutos.cep)?.replace(/\D/g, "") ?? null,
    bairro_informado: textoOuNulo(dadosBrutos.bairro_informado),
    cidade: textoOuNulo(dadosBrutos.cidade),
    uf: textoOuNulo(dadosBrutos.uf)?.toUpperCase() ?? null,
    vendedor: textoOuNulo(dadosBrutos.vendedor_responsavel),
    telefone: normalizarTelefone(dadosBrutos.telefone),
  };
}
