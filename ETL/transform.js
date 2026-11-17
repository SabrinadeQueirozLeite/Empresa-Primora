
// TRANSFORM: recebe UMA linha crua do CSV e devolve UM objeto tratado,
// com os nomes iguais às colunas do banco, mais a lista "auditoria"
// (valor original -> valor tratado -> critério -> fonte).

// ---------- utilitários ----------

const vazio = (v) => v === undefined || v === null || String(v).trim() === "";

const semAcento = (texto) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const MINUSCULAS = new Set(["de", "da", "do", "das", "dos", "e"]);

function titulo(texto) {
    return texto
        .toLowerCase()
        .split(" ")
        .map((p, i) => (i > 0 && MINUSCULAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
        .join(" ");
}

// ---------- BAIRRO ----------
// Regras de agrupamento:
//  - "Norte/Sul (Águas Claras)" e "Águas Claras Norte/Sul" são subdivisões
//    informais e vão para o bairro oficial "Águas Claras".
//  - "Taguatinga Sul", "taguatinga sul" -> "Taguatinga".
//  - "V. Pires", "Vte Pires" -> "Vicente Pires".
//  - Guará I e Guará II são mantidos separados; "Guará" sozinho fica "Guará".
// A comparação é feita sobre uma chave sem acento, em maiúsculas e sem
// pontuação, por isso "Sul (Águas Claras)" vira "SUL AGUAS CLARAS".
const REGRAS_BAIRRO = [
    { regex: /\b(AGUAS CLARAS|AREAL)\b/, canonico: "Águas Claras" },
    { regex: /\bTAGUATINGA\b/, canonico: "Taguatinga" },
    { regex: /\b(VICENTE|VTE|V) PIRES\b/, canonico: "Vicente Pires" },
    { regex: /\bGUARA (II|2)\b/, canonico: "Guará II" },
    { regex: /\bGUARA (I|1)\b/, canonico: "Guará I" },
    { regex: /\bGUARA\b/, canonico: "Guará" },
];

function chaveBairro(texto) {
    return semAcento(texto).toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim();
}

export function normalizarBairro(original) {
    if (vazio(original)) {
        return { valor: null, criterio: "bairro ausente", fonte: "CSV" };
    }

    const chave = chaveBairro(original);
    const regra = REGRAS_BAIRRO.find((r) => r.regex.test(chave));

    if (regra) {
        const chaveSemUF = chave.replace(/ DF$/, "");
        const apenasGrafia = chaveSemUF === chaveBairro(regra.canonico);

        return apenasGrafia
            ? {
                  valor: regra.canonico,
                  criterio: "normalização textual (caixa, acentos e sufixo UF)",
                  fonte: "CSV",
              }
            : {
                  valor: regra.canonico,
                  criterio: `dicionário de variantes: "${original.trim()}" agrupado em ${regra.canonico}`,
                  fonte: "dicionário",
              };
    }

    // Sem regra no dicionário: só limpa o texto
    const limpo = original.trim().replace(/\s+/g, " ").replace(/\s*[-/]\s*DF$/i, "");
    return {
        valor: titulo(limpo),
        criterio: "normalização textual (sem correspondência no dicionário)",
        fonte: "CSV",
    };
}

// ---------- DATA ----------
// Formatos encontrados no CSV: 2022-06-21 | 28/02/2022 | 08-01-2022 | Dec 24, 2023
// Premissa: com "-" ou "/" o DIA vem primeiro (há linhas como 15-08-2024 e
// 22-11-2022 que provam isso). Mês por extenso em inglês ou português.
const MESES = {
    jan: 1, feb: 2, fev: 2, mar: 3, apr: 4, abr: 4, may: 5, mai: 5, jun: 6,
    jul: 7, aug: 8, ago: 8, sep: 9, set: 9, oct: 10, out: 10, nov: 11, dec: 12, dez: 12,
};

function montarData(ano, mes, dia) {
    const d = new Date(Date.UTC(ano, mes - 1, dia));
    const existe =
        d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
    if (!existe) return null;
    return `${String(ano).padStart(4, "0")}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

export function normalizarData(texto) {
    if (vazio(texto)) return { valor: null, criterio: "data ausente" };

    const t = texto.trim();
    let m;

    if ((m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/))) {
        return { valor: montarData(+m[1], +m[2], +m[3]), criterio: "formato AAAA-MM-DD mantido" };
    }
    if ((m = t.match(/^(\d{2})\/(\d{2})\/(\d{4})$/))) {
        return { valor: montarData(+m[3], +m[2], +m[1]), criterio: "DD/MM/AAAA convertido para AAAA-MM-DD" };
    }
    if ((m = t.match(/^(\d{2})-(\d{2})-(\d{4})$/))) {
        return {
            valor: montarData(+m[3], +m[2], +m[1]),
            criterio: "DD-MM-AAAA (dia primeiro, premissa do grupo) convertido para AAAA-MM-DD",
        };
    }
    if ((m = t.match(/^([A-Za-z]{3})[A-Za-z]*\.? (\d{1,2}), (\d{4})$/))) {
        const mes = MESES[m[1].toLowerCase()];
        return {
            valor: mes ? montarData(+m[3], mes, +m[2]) : null,
            criterio: "mês por extenso convertido para AAAA-MM-DD",
        };
    }
    return { valor: null, criterio: "formato de data não reconhecido; descartado" };
}

// ---------- TELEFONE ----------
// Aceita: 61970855700 | +55 61 95386-2084 | (61) 98433-1053 | (61) 3491-1634
export function normalizarTelefone(texto) {
    const invalido = (criterio) => ({ ddd: null, numero: null, tipo: null, criterio });

    if (vazio(texto)) return invalido("telefone ausente");

    let digitos = String(texto).replace(/\D/g, "");

    // remove o código do país (55) quando sobra DDD + número
    if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith("55")) {
        digitos = digitos.slice(2);
    }
    if (digitos.length !== 10 && digitos.length !== 11) {
        return invalido("telefone inválido: quantidade de dígitos incompatível; descartado");
    }

    const ddd = digitos.slice(0, 2);
    const numero = digitos.slice(2);

    if (numero.length === 9 && numero.startsWith("9")) {
        return { ddd, numero, tipo: "Celular", criterio: "somente dígitos, DDD separado, tipo Celular (9 dígitos)" };
    }
    if (numero.length === 8) {
        return { ddd, numero, tipo: "Fixo", criterio: "somente dígitos, DDD separado, tipo Fixo (8 dígitos)" };
    }
    return invalido("telefone inválido: número de 9 dígitos que não começa com 9; descartado");
}

// ---------- CNPJ ----------
// Valida só o FORMATO (14 dígitos). Os CNPJs do dataset são fictícios e nenhum
// passa no dígito verificador; validar o dígito rejeitaria a base inteira.
export function normalizarCnpj(texto) {
    if (vazio(texto)) return { valor: null, criterio: "CNPJ ausente" };

    const digitos = String(texto).replace(/\D/g, "");
    return digitos.length === 14
        ? { valor: digitos, criterio: "somente dígitos (máscara removida)" }
        : { valor: null, criterio: "CNPJ inválido: não tem 14 dígitos; descartado" };
}

// ---------- CEP ----------
export function normalizarCep(texto) {
    if (vazio(texto)) return { valor: null, criterio: "CEP ausente" };

    const digitos = String(texto).replace(/\D/g, "");

    if (digitos.length !== 8) {
        return { valor: null, criterio: "CEP inválido: não tem 8 dígitos; descartado" };
    }
    if (/^0+$/.test(digitos)) {
        return { valor: null, criterio: "CEP inválido (00000-000 é placeholder); descartado" };
    }
    return { valor: digitos, criterio: "somente dígitos (máscara removida)" };
}

// ---------- TRANSFORMAÇÃO DE UMA LINHA ----------

export function transformarEmpresa(linha) {
    const auditoria = [];

    // Registra na auditoria quando o valor mudou (ou quando "forcar" for true)
    function registrar(campo, original, tratado, criterio, fonte = "regra local", forcar = false) {
        const o = vazio(original) ? null : String(original);
        const t = vazio(tratado) ? null : String(tratado);

        if (forcar || o !== t) {
            auditoria.push({ campo, valor_original: o, valor_tratado: t, criterio, fonte });
        }
    }

    // 1. Id (no CSV a coluna se chama id_cliente)
    const id_empresa = vazio(linha.id_cliente) ? null : String(linha.id_cliente).trim();

    // 2. Razão social
    const razaoAusente = vazio(linha.razao_social);
    const razao_social = razaoAusente
        ? "NÃO INFORMADO"
        : linha.razao_social.trim().replace(/\s+/g, " ").toUpperCase();
    registrar(
        "razao_social",
        linha.razao_social,
        razao_social,
        razaoAusente
            ? "razão social ausente; preenchida com NÃO INFORMADO"
            : "trim, espaços repetidos e caixa alta"
    );

    // 3. E-mail
    let email = null;
    let criterioEmail = "trim e caixa baixa";
    if (!vazio(linha.email)) {
        const e = linha.email.trim().toLowerCase();
        if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) {
            email = e;
        } else {
            criterioEmail = "e-mail inválido (formato); descartado";
        }
    }
    registrar("email", linha.email, email, criterioEmail);

    // 4. Data de cadastro
    const data = normalizarData(linha.data_cadastro);
    registrar("data_cadastro", linha.data_cadastro, data.valor, data.criterio);

    // 5. CNPJ
    const cnpj = normalizarCnpj(linha.cnpj);
    registrar("cnpj", linha.cnpj, cnpj.valor, cnpj.criterio);

    // 6. Telefone
    const tel = normalizarTelefone(linha.telefone);
    registrar(
        "telefone",
        linha.telefone,
        tel.numero ? `${tel.ddd}${tel.numero}` : null,
        tel.criterio
    );

    // 7. Endereço
    const cep = normalizarCep(linha.cep);
    registrar("cep", linha.cep, cep.valor, cep.criterio);
    if (cep.valor === null && vazio(linha.cep)) {
        // CEP ausente não muda o valor, mas é uma inconsistência que precisa ficar registrada
        registrar("cep", null, null, "CEP ausente; endereço não enriquecido pela ViaCEP", "regra local", true);
    }

    const bairro = normalizarBairro(linha.bairro_informado);
    registrar("bairro", linha.bairro_informado, bairro.valor, bairro.criterio, bairro.fonte);

    const cidade = vazio(linha.cidade) ? null : linha.cidade.trim();
    registrar("cidade", linha.cidade, cidade, "trim");

    const uf = !vazio(linha.uf) && /^[A-Za-z]{2}$/.test(linha.uf.trim()) ? linha.uf.trim().toUpperCase() : null;
    registrar("uf", linha.uf, uf, "trim e caixa alta");

    // 8. Vendedor
    const vendedor = vazio(linha.vendedor_responsavel)
        ? null
        : linha.vendedor_responsavel.trim().replace(/\s+/g, " ");

    // 9. Objeto final (nomes iguais às colunas do banco)
    return {
        id_empresa,
        razao_social,
        email,
        data_cadastro: data.valor,
        cnpj: cnpj.valor,
        vendedor,
        ddd: tel.ddd,
        numero: tel.numero,
        tipo: tel.tipo,
        cep: cep.valor,
        logradouro: null, // preenchidos pela ViaCEP, se o CEP for encontrado
        complemento: null,
        bairro: bairro.valor,
        cidade,
        uf,
        auditoria,
    };
}