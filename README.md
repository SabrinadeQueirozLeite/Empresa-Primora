# Projeto-Primora

## Visão Geral ##


## Pacotes Utilizados ##

| Pacote | Versão | Descrição |
| :--- | :--- | :--- |
| **bcryptjs** | `^3.0.3` | Biblioteca para hash e comparação segura de senhas |
| **csv-parser** | `^3.2.1` | Parser de fluxo rápido para leitura do arquivo CSV de clientes |
| **dotenv** | `^18.0.10` | Carregamento seguro de variáveis de ambiente a partir de arquivos `.env` |
| **express** | `^5.3.0` | Framework web para construção de APIs e gerenciamento de rotas |
| **fast-csv** | `^5.0.8` | Biblioteca para manipulação, leitura e escrita de arquivos CSV |
| **jsonwebtoken** | `^9.0.3` | Implementação de JSON Web Tokens (JWT) para autenticação baseada em tokens |
| **pg** | `^8.23.1` | Cliente PostgreSQL para Node.js (adaptador de banco de dados) |
| **nodemon** *(dev)* | `^3.1.14` | Ferramenta de desenvolvimento para reiniciar automaticamente o servidor Node.js ao detectar alterações |


## Estrutura do Projeto #

```text
├── API/                             # Camada de servidor web e entrega de dados
│   ├── public/                      # Arquivos estáticos do front-end
│   │   └── index.html               # Interface web para consulta dos dados
│   ├── db.js                        # Configuração e conexão com o banco de dados
│   └── server.js                    # Inicialização do servidor e rotas da API
├── ETL/                             # Pipeline de Extração, Transformação e Carga
│   ├── data/                        # Armazenamento de dados brutos ou processados
│   ├── test/                        # Testes
│   │   ├── Viacep.test.js           # Testes unitários da integração com o ViaCEP
│   │   └── transform.test.js        # Testes unitários das regras de transformação
│   ├── extract.js                   # Extração dos dados de origem
│   ├── index.js                     # Orquestrador que executa o fluxo completo de ETL
│   ├── load.js                      # Inserção dos dados tratados no banco de dados
│   ├── transform.js                 # Limpeza, padronização e enriquecimento dos dados
│   └── viacep.js                    # Consulta de endereços na API pública do ViaCEP
├── MER/                             # Documentação visual do banco de dados
│   ├── MER.png                      # Imagem do Modelo Entidade-Relacionamento
│   └── mer_conceitual.excalidraw    # Arquivo editável do diagrama no Excalidraw
├── sql/                             # Scripts de banco de dados
│   └── Empresa.Primora.sql          # Script SQL para criação das tabelas e estrutura
├── .gitignore                       # Arquivos ignorados pelo controle de versão (Git)
├── README.md                        # Documentação geral e guia de uso do projeto
├── package-lock.json                # Trava das versões exatas das dependências
└── package.json                     # Metadados, scripts e dependências do Node.js
```

## Diagrama do Banco de Dados ##

<img src="MER/MER.png" alt="Diagrama do Banco de Dados" height="300" />

**Documentação da API**

# Documentação das Rotas

| MÉTODO | ROTA                  | DESCRIÇÃO              |
|--------|-----------------------|------------------------|
| GET    |/                      | Teste com sucesso!|
| GET    |/telefones             | Retorna os telefones|
| GET    |/empresas/:id          | Retorna empresa pelo ID|
| GET    |/empresas/:id/auditoria| Retorna empresa pelo ID da auditoria|
| GET    |/empresas/             | Mostra todas as empresa|
| POST   |/ empresas             |Cadastra uma nova empresa|
| PUT    | /api/users/:id        | Atualizar usuário      |
| DELETE | /api/users/:id        | Excluir usuário        |
| PUT    | /api/users/:id        | Atualizar usuário      |
| DELETE | /api/users/:id        | Excluir usuário        |



## Configurações do Ambiente ##
**Execução do ETL**

Configure `DB_USER`, `DB_PASSWORD`, `DB_NAME` e `DB_HOST` no arquivo `.env` (e
`DB_PORT` se o PostgreSQL não usar a porta padrão). Com as tabelas do banco já
criadas, execute:

```bash
npm run etl
```

O processo lê `ETL/data/clientes_distribuidora_vetor.csv`, normaliza os dados e
grava empresas, vendedores, telefones e endereços em uma única transação. As
empresas existentes são atualizadas quando o ETL é executado novamente.
