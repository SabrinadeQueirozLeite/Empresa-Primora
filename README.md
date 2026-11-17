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

**Rotas da aplicação
Método	Rota	Descrição	Autenticação
GET	/api/users	Lista todos os usuários	Sim
GET	/api/users/:id	Busca um usuário pelo ID	Sim
POST	/api/users	Cadastra um novo usuário	Sim
PUT	/api/users/:id	Atualiza os dados de um usuário	Sim
DELETE	/api/users/:id	Remove um usuário	Sim

**Diagrama de Banco de Dados**

**Configurações do Ambiente**
