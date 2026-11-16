import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { enriquecerEndereco, consultarCep, limparCache } from "../viacep.js";

// Nenhum teste chama a internet: o "fetch" é sempre um falso.
const respostaOk = (dados) => async () => ({ ok: true, json: async () => dados });

const novaEmpresa = (extra = {}) => ({
    cep: "71900001",
    bairro: "Águas Claras",
    logradouro: null,
    complemento: null,
    cidade: "Brasília",
    uf: "DF",
    auditoria: [],
    ...extra,
});

beforeEach(() => limparCache());

test("preenche o logradouro vindo do CEP e registra na auditoria", async () => {
    const buscar = respostaOk({ logradouro: "Rua das Flores", bairro: "Águas Claras", localidade: "Brasília", uf: "DF" });
    const e = await enriquecerEndereco(novaEmpresa(), buscar);

    assert.equal(e.logradouro, "Rua das Flores");
    assert.ok(e.auditoria.some((a) => a.campo === "logradouro" && a.fonte === "ViaCEP"));
});

test("divergência de bairro: prevalece a ViaCEP e a auditoria guarda os dois valores", async () => {
    const buscar = respostaOk({ logradouro: "Rua X", bairro: "Taguatinga Norte (Taguatinga)", localidade: "Brasília", uf: "DF" });
    const e = await enriquecerEndereco(novaEmpresa({ bairro: "Águas Claras" }), buscar);

    assert.equal(e.bairro, "Taguatinga");
    const a = e.auditoria.find((x) => x.campo === "bairro");
    assert.equal(a.valor_original, "Águas Claras");
    assert.equal(a.valor_tratado, "Taguatinga");
    assert.match(a.criterio, /divergência/);
});

test("mesmo bairro com nome diferente na ViaCEP NÃO é divergência", async () => {
    const buscar = respostaOk({ logradouro: "Rua X", bairro: "Taguatinga Sul (Taguatinga)", localidade: "Brasília", uf: "DF" });
    const e = await enriquecerEndereco(novaEmpresa({ cep: "71900002", bairro: "Taguatinga" }), buscar);

    assert.equal(e.bairro, "Taguatinga");
    assert.ok(!e.auditoria.some((a) => a.campo === "bairro"));
});

test("bairro ausente é preenchido pelo CEP", async () => {
    const buscar = respostaOk({ logradouro: "Rua X", bairro: "Areal (Águas Claras)", localidade: "Brasília", uf: "DF" });
    const e = await enriquecerEndereco(novaEmpresa({ cep: "71900003", bairro: null }), buscar);

    assert.equal(e.bairro, "Águas Claras");
    assert.ok(e.auditoria.some((a) => a.campo === "bairro" && /ausente/.test(a.criterio)));
});

test("CEP não encontrado mantém o bairro informado", async () => {
    const e = await enriquecerEndereco(novaEmpresa({ cep: "71900004", bairro: "Guará I" }), respostaOk({ erro: true }));

    assert.equal(e.bairro, "Guará I");
    assert.match(e.auditoria[0].criterio, /não encontrado/);
});

test("API fora do ar não derruba o pipeline", async () => {
    const buscar = async () => { throw new Error("sem internet"); };
    const e = await enriquecerEndereco(novaEmpresa({ cep: "71900005", bairro: "Taguatinga" }), buscar);

    assert.equal(e.bairro, "Taguatinga");
    assert.match(e.auditoria[0].criterio, /indisponível/);
});

test("resposta HTTP de erro também é tratada como indisponível", async () => {
    const buscar = async () => ({ ok: false, json: async () => ({}) });
    const e = await enriquecerEndereco(novaEmpresa({ cep: "71900006" }), buscar);

    assert.match(e.auditoria[0].criterio, /indisponível/);
});

test("empresa sem CEP não chama a API", async () => {
    let chamadas = 0;
    const buscar = async () => { chamadas++; return { ok: true, json: async () => ({}) }; };
    await enriquecerEndereco(novaEmpresa({ cep: null }), buscar);

    assert.equal(chamadas, 0);
});

test("o cache evita consultar o mesmo CEP duas vezes", async () => {
    let chamadas = 0;
    const buscar = async () => {
        chamadas++;
        return { ok: true, json: async () => ({ logradouro: "Rua X", bairro: "Águas Claras", localidade: "Brasília", uf: "DF" }) };
    };

    await consultarCep("71900007", buscar);
    await consultarCep("71900007", buscar);

    assert.equal(chamadas, 1);
});

test("falha da API não entra no cache (a próxima tentativa consulta de novo)", async () => {
    let chamadas = 0;
    const buscar = async () => { chamadas++; throw new Error("fora do ar"); };

    await consultarCep("71900008", buscar);
    await consultarCep("71900008", buscar);

    assert.equal(chamadas, 2);
});