import { test } from "node:test";
import assert from "node:assert/strict";
import {
    normalizarBairro,
    normalizarData,
    normalizarTelefone,
    normalizarCnpj,
    normalizarCep,
    transformarEmpresa,
} from "../transform.js";

// ---------- BAIRRO (grafias reais do CSV) ----------

test("bairro: todas as grafias de Águas Claras viram um único valor", () => {
    const grafias = [
        "Águas Claras", "Aguas claras", "AGUAS CLARAS", "aguas claras",
        "Águas Claras/DF", "Aguas Claras - DF",
        "Sul (Águas Claras)", "Sul (Aguas Claras)",
        "Norte (Águas Claras)", "Norte (Aguas Claras)",
        "Águas Claras Sul", "Águas Claras Norte",
    ];
    for (const g of grafias) {
        assert.equal(normalizarBairro(g).valor, "Águas Claras", g);
    }
});

test("bairro: Taguatinga e Vicente Pires agrupam suas variantes", () => {
    for (const g of ["TAGUATINGA", "Taguatinga - DF", "Taguatinga/DF", "taguatinga sul"]) {
        assert.equal(normalizarBairro(g).valor, "Taguatinga", g);
    }
    for (const g of ["V. Pires", "Vte Pires", "VICENTE PIRES", "Vicente Pires - DF"]) {
        assert.equal(normalizarBairro(g).valor, "Vicente Pires", g);
    }
});

test("bairro: Guará I e Guará II continuam separados", () => {
    assert.equal(normalizarBairro("Guará I").valor, "Guará I");
    assert.equal(normalizarBairro("Guará II").valor, "Guará II");
    assert.equal(normalizarBairro("guara - df").valor, "Guará");
});

test("bairro: subdivisão informal usa o dicionário; só caixa/acento usa regra local", () => {
    const sub = normalizarBairro("Norte (Águas Claras)");
    assert.equal(sub.fonte, "dicionário");
    assert.match(sub.criterio, /Norte \(Águas Claras\)/);

    const grafia = normalizarBairro("AGUAS CLARAS");
    assert.equal(grafia.fonte, "regra local");
});

test("bairro: ausente vira null e bairro desconhecido só é limpo", () => {
    assert.equal(normalizarBairro("").valor, null);
    assert.equal(normalizarBairro(undefined).valor, null);
    assert.equal(normalizarBairro("  setor sol nascente - DF ").valor, "Setor Sol Nascente");
});

// ---------- DATA (formatos reais do CSV) ----------

test("data: converte todos os formatos do CSV para AAAA-MM-DD", () => {
    assert.equal(normalizarData("2022-06-21").valor, "2022-06-21");
    assert.equal(normalizarData("28/02/2022").valor, "2022-02-28");
    assert.equal(normalizarData("15-08-2024").valor, "2024-08-15");
    assert.equal(normalizarData("08-01-2022").valor, "2022-01-08"); // dia primeiro
    assert.equal(normalizarData("Dec 24, 2023").valor, "2023-12-24");
    assert.equal(normalizarData("jul 21, 2022").valor, "2022-07-21");
    assert.equal(normalizarData("Apr 3, 2025").valor, "2025-04-03");
});

test("data: inválida ou desconhecida vira null (não inventa data)", () => {
    assert.equal(normalizarData("31/02/2022").valor, null);
    assert.equal(normalizarData("ontem").valor, null);
    assert.equal(normalizarData("").valor, null);
});

// ---------- TELEFONE ----------

test("telefone: separa DDD e classifica o tipo", () => {
    assert.deepEqual(
        (({ ddd, numero, tipo }) => ({ ddd, numero, tipo }))(normalizarTelefone("61970855700")),
        { ddd: "61", numero: "970855700", tipo: "Celular" }
    );
    assert.equal(normalizarTelefone("+55 61 95386-2084").numero, "953862084");
    assert.equal(normalizarTelefone("(61) 98433-1053").ddd, "61");

    const fixo = normalizarTelefone("(61) 3491-1634");
    assert.equal(fixo.numero, "34911634");
    assert.equal(fixo.tipo, "Fixo");
    assert.equal(normalizarTelefone("61 3970-2193").tipo, "Fixo");
});

test("telefone: inválido ou ausente vira null", () => {
    assert.equal(normalizarTelefone("12345").numero, null);
    assert.equal(normalizarTelefone("").numero, null);
    assert.equal(normalizarTelefone("(61) 83333-1111").numero, null); // 9 dígitos sem iniciar com 9
});

// ---------- CNPJ e CEP ----------

test("cnpj: remove máscara e exige 14 dígitos", () => {
    assert.equal(normalizarCnpj("84.959.310/3413-16").valor, "84959310341316");
    assert.equal(normalizarCnpj("27868011280598").valor, "27868011280598");
    assert.equal(normalizarCnpj("123").valor, null);
    assert.equal(normalizarCnpj("").valor, null);
});

test("cep: remove máscara; vazio e 00000-000 viram null", () => {
    assert.equal(normalizarCep("71926-750").valor, "71926750");
    assert.equal(normalizarCep("00000-000").valor, null);
    assert.equal(normalizarCep("").valor, null);
    assert.equal(normalizarCep("123").valor, null);
});

// ---------- LINHA COMPLETA ----------

const linhaSuja = {
    id_cliente: "CLI0002",
    razao_social: "  Comercial São Judas ",
    cnpj: "28.327.648/3503-05",
    telefone: "+55 61 95386-2084",
    email: " Contato@ComercialSão.com.br ",
    bairro_informado: "Sul (Aguas Claras)",
    cep: "72140-010",
    cidade: "Brasília",
    uf: "df",
    data_cadastro: "Dec 24, 2023",
    vendedor_responsavel: "Camila Torres",
};

test("linha completa: nomes batem com as colunas do banco e a auditoria explica as mudanças", () => {
    const r = transformarEmpresa(linhaSuja);

    assert.equal(r.id_empresa, "CLI0002");
    assert.equal(r.razao_social, "COMERCIAL SÃO JUDAS");
    assert.equal(r.cnpj, "28327648350305");
    assert.equal(r.email, "contato@comercialsão.com.br");
    assert.equal(r.data_cadastro, "2023-12-24");
    assert.equal(r.ddd, "61");
    assert.equal(r.tipo, "Celular");
    assert.equal(r.cep, "72140010");
    assert.equal(r.bairro, "Águas Claras");
    assert.equal(r.uf, "DF");
    assert.equal(r.vendedor, "Camila Torres");

    const campos = r.auditoria.map((a) => a.campo);
    for (const c of ["razao_social", "email", "data_cadastro", "cnpj", "telefone", "cep", "bairro", "uf"]) {
        assert.ok(campos.includes(c), `faltou auditoria de ${c}`);
    }

    const aBairro = r.auditoria.find((a) => a.campo === "bairro");
    assert.equal(aBairro.valor_original, "Sul (Aguas Claras)");
    assert.equal(aBairro.valor_tratado, "Águas Claras");
});

test("linha completa: campo que já estava certo não gera auditoria", () => {
    const r = transformarEmpresa({ ...linhaSuja, data_cadastro: "2023-10-07", cidade: "Brasília" });
    assert.ok(!r.auditoria.some((a) => a.campo === "data_cadastro"));
    assert.ok(!r.auditoria.some((a) => a.campo === "cidade"));
});

test("linha completa: CEP ausente e inválido ficam registrados na auditoria", () => {
    const ausente = transformarEmpresa({ ...linhaSuja, cep: "" });
    assert.equal(ausente.cep, null);
    assert.ok(ausente.auditoria.some((a) => a.campo === "cep" && /ausente/.test(a.criterio)));

    const zerado = transformarEmpresa({ ...linhaSuja, cep: "00000-000" });
    assert.equal(zerado.cep, null);
    assert.ok(zerado.auditoria.some((a) => a.campo === "cep" && /placeholder/.test(a.criterio)));
});