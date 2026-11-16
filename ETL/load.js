import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const requiredVariables = ["DB_USER", "DB_PASSWORD", "DB_NAME", "DB_HOST"];
const missingVariables = requiredVariables.filter(
  (variable) => !process.env[variable],
);

if (missingVariables.length > 0) {
  throw new Error(`Variáveis ausentes no .env: ${missingVariables.join(", ")}`);
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 5432),
});

export async function carregarEmpresas(empresas) {
  const conexao = await pool.connect();

  try {
    await conexao.query("BEGIN");
    await conexao.query("LOCK TABLE telefone IN EXCLUSIVE MODE");
    const resultadoTelefone = await conexao.query(
      "SELECT COALESCE(MAX(id_telefone), 0) AS ultimo_id FROM telefone",
    );
    let proximoIdTelefone = Number(resultadoTelefone.rows[0].ultimo_id) + 1;

    for (const empresa of empresas) {
      let idVendedor = null;

      if (empresa.vendedor) {
        const vendedorExistente = await conexao.query(
          "SELECT id_vendedor FROM vendedor WHERE LOWER(nome) = LOWER($1) ORDER BY id_vendedor LIMIT 1",
          [empresa.vendedor],
        );
        idVendedor = vendedorExistente.rows[0]?.id_vendedor;

        if (idVendedor === undefined) {
          const novoVendedor = await conexao.query(
            "INSERT INTO vendedor (nome) VALUES ($1) RETURNING id_vendedor",
            [empresa.vendedor],
          );
          idVendedor = novoVendedor.rows[0].id_vendedor;
        }
      }

      await conexao.query(
        `INSERT INTO empresa (
          id_empresa, cnpj, razao_social, email, data_cadastro, id_vendedor
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id_empresa)
        DO UPDATE SET
          cnpj = EXCLUDED.cnpj,
          razao_social = EXCLUDED.razao_social,
          email = EXCLUDED.email,
          data_cadastro = EXCLUDED.data_cadastro,
          id_vendedor = EXCLUDED.id_vendedor`,
        [
          empresa.id_empresa,
          empresa.cnpj,
          empresa.razao_social,
          empresa.email,
          empresa.data_cadastro,
          idVendedor,
        ],
      );

      await conexao.query("DELETE FROM telefone WHERE id_empresa = $1", [
        empresa.id_empresa,
      ]);
      if (empresa.telefone) {
        await conexao.query(
          `INSERT INTO telefone (id_telefone, id_empresa, ddd, numero, tipo)
          VALUES ($1, $2, $3, $4, $5)`,
          [
            proximoIdTelefone++,
            empresa.id_empresa,
            empresa.telefone.ddd,
            empresa.telefone.numero,
            empresa.telefone.tipo,
          ],
        );
      }

      await conexao.query("DELETE FROM endereco WHERE id_empresa = $1", [
        empresa.id_empresa,
      ]);
      if (
        empresa.cep ||
        empresa.bairro_informado ||
        empresa.cidade ||
        empresa.uf
      ) {
        await conexao.query(
          `INSERT INTO endereco (
            cep, bairro_informado, cidade, uf, id_empresa
          )
          VALUES ($1, $2, $3, $4, $5)`,
          [
            empresa.cep,
            empresa.bairro_informado,
            empresa.cidade,
            empresa.uf,
            empresa.id_empresa,
          ],
        );
      }
    }

    await conexao.query("COMMIT");
    console.log(`${empresas.length} empresas carregadas com sucesso.`);
  } catch (erro) {
    await conexao.query("ROLLBACK");
    throw erro;
  } finally {
    conexao.release();
  }
}

export async function encerrarConexao() {
  await pool.end();
}
