# Projeto-Primora

## Execução do ETL

Configure `DB_USER`, `DB_PASSWORD`, `DB_NAME` e `DB_HOST` no arquivo `.env` (e
`DB_PORT` se o PostgreSQL não usar a porta padrão). Com as tabelas do banco já
criadas, execute:

```bash
npm run etl
```

O processo lê `ETL/data/clientes_distribuidora_vetor.csv`, normaliza os dados e
grava empresas, vendedores, telefones e endereços em uma única transação. As
empresas existentes são atualizadas quando o ETL é executado novamente.




**Visão Geral**

**Estrutura do Projeto**

**Diagrama de Banco de Dados**

**Configurações do Ambiente**
