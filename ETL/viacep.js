// ======================================================================
// ENRIQUECIMENTO com a ViaCEP (fonte de referência geográfica).
// - Cache local: o mesmo CEP nunca é consultado duas vezes.
// - "buscar" é parâmetro para os testes trocarem o fetch por um falso.
// - Falha da API nunca derruba o pipeline: o endereço fica como informado
//   e o motivo vai para a auditoria.
// ======================================================================

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { normalizarBairro } from "./transform.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARQUIVO_CACHE = path.join(__dirname, "data", "cache_viacep.json");

function lerCache() {
    try {
        return JSON.parse(fs.readFileSync(ARQUIVO_CACHE, "utf-8"));
    } catch {
        return {};
    }
}

let cache = lerCache();

// Usado nos testes, para um teste não depender do cache de outro
export function limparCache() {
    cache = {};
}

export function salvarCache() {
    fs.mkdirSync(path.dirname(ARQUIVO_CACHE), { recursive: true });
    fs.writeFileSync(ARQUIVO_CACHE, JSON.stringify(cache, null, 2));
}

export async function consultarCep(cep, buscar = fetch) {
    if (cache[cep]) return cache[cep];

    try {
        const resposta = await buscar(`https://viacep.com.br/ws/${cep}/json/`, {
            signal: AbortSignal.timeout(8000),
        });
        if (!resposta.ok) return null; // falha: não guarda no cache

        const dados = await resposta.json();
        const resultado = dados.erro
            ? { naoEncontrado: true }
            : {
                  logradouro: dados.logradouro || null,
                  complemento: dados.complemento || null,
                  bairro: dados.bairro || null,
                  cidade: dados.localidade || null,
                  uf: dados.uf || null,
              };

        cache[cep] = resultado;
        return resultado;
    } catch {
        return null; // sem internet, timeout ou API fora do ar
    }
}

export async function enriquecerEndereco(empresa, buscar = fetch) {
    if (!empresa.cep) return empresa; // sem CEP não há o que consultar (já auditado no transform)

    const ref = await consultarCep(empresa.cep, buscar);

    function registrar(campo, original, tratado, criterio) {
        empresa.auditoria.push({
            campo,
            valor_original: original ?? null,
            valor_tratado: tratado ?? null,
            criterio,
            fonte: "ViaCEP",
        });
    }

    if (!ref) {
        registrar("cep", empresa.cep, empresa.cep, "ViaCEP indisponível; endereço mantido como informado");
        return empresa;
    }

    if (ref.naoEncontrado) {
        registrar("cep", empresa.cep, empresa.cep, "CEP não encontrado na ViaCEP; bairro informado mantido");
        return empresa;
    }

    // Campos que só existem na API (ou que estavam vazios): preenche e audita
    for (const campo of ["logradouro", "complemento", "cidade", "uf"]) {
        if (!empresa[campo] && ref[campo]) {
            empresa[campo] = ref[campo];
            registrar(campo, null, ref[campo], "preenchido a partir do CEP");
        }
    }

    // Bairro: critério de divergência.
    // O bairro da ViaCEP passa pelo MESMO dicionário do transform, senão
    // "Taguatinga Sul (Taguatinga)" pareceria divergir de "Taguatinga".
    const bairroRef = normalizarBairro(ref.bairro).valor;

    if (bairroRef) {
        if (!empresa.bairro) {
            registrar("bairro", null, bairroRef, "bairro ausente; preenchido a partir do CEP");
            empresa.bairro = bairroRef;
        } else if (bairroRef !== empresa.bairro) {
            // DECISÃO DO GRUPO (a validar): quando o bairro informado diverge do
            // bairro do CEP, prevalece a ViaCEP e a divergência fica na auditoria.
            registrar(
                "bairro",
                empresa.bairro,
                bairroRef,
                `divergência entre o bairro informado e o CEP ${empresa.cep}; prevaleceu a ViaCEP`
            );
            empresa.bairro = bairroRef;
        }
    }

    return empresa;
}