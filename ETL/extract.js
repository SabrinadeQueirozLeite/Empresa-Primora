import fs from "node:fs";
import { pipeline } from "node:stream/promises";
import csv from "csv-parser";
import { fileURLToPath } from "node:url";

const csvPath = fileURLToPath(
  new URL("./data/clientes_distribuidora_vetor.csv", import.meta.url),
);

export async function extrairEmpresas() {
  const linhasExtraidas = [];
  const parser = csv({ separator: ";" });
  parser.on("data", (linha) => linhasExtraidas.push(linha));

  await pipeline(fs.createReadStream(csvPath), parser);
  console.log(`${linhasExtraidas.length} linhas extraídas do CSV.`);

  return linhasExtraidas;
}
