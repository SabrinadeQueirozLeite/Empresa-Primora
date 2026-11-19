# Projeto-Primora


## Sumário

* [Visão Geral](#visão-geral)
* [Pacotes Utilizados](#pacotes-utilizados)
* [Estrutura do Projeto](#estrutura-do-projeto)
* [Diagrama do Banco de Dados](#diagrama-do-banco-de-dados)
  * [Entidades](#entidades)
  * [Relacionamentos e Cardinalidades](#relacionamentos-e-cardinalidades)
  * [Campos Críticos](#campos-críticos)
* [Documentação da API](#documentação-da-api)
* [Configurações do Ambiente](#configurações-do-ambiente)

## Visão Geral
<div align="justify">
O projeto Empresa Primora tem como objetivo organizar e qualificar os dados cadastrais fictícios da Distribuidora Vetor, uma atacadista B2B que comercializa produtos para varejistas por meio de uma equipe de vendas externa.

A base original apresenta informações concentradas em um único arquivo CSV, incluindo identificação das empresas, CNPJ, telefone, e-mail, endereço, data de cadastro e vendedor responsável.

Entretanto, os registros apresentam diferentes formatos de preenchimento, informações ausentes e possíveis inconsistências. Por esse motivo, foi desenvolvido um processo ETL (Extract, Transform, Load), responsável pela extração dos registros, aplicação de regras de tratamento e carregamento das informações no PostgreSQL.

Como parte desse processo, foi desenvolvida uma integração com a API ViaCEP para consultar os dados de endereço a partir do CEP informado no cadastro. O retorno da API é utilizado como referência para comparar as informações originais com os dados consultados, permitindo identificar divergências e sinalizar registros que necessitam de revisão. Dessa forma, a integração complementa as etapas de tratamento do ETL, contribuindo para a padronização dos endereços e para a confiabilidade dos dados armazenados.
</div>

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


## Entidades

### 1. Vendedor

Responsável por representar os vendedores vinculados ao atendimento das empresas cadastradas no sistema. Um vendedor pode atender uma ou várias empresas, permitindo identificar o responsável comercial por cada cadastro.

| Campo | Descrição |
|:---|:---|
| `id_vendedor` | Identificador único do vendedor (**Chave Primária – PK**). |
| `nome` | Nome completo do vendedor. |

### 2. Empresa

Representa a entidade central do sistema, armazenando as principais informações cadastrais e de identificação de cada organização. Está relacionada às demais entidades, concentrando os vínculos com vendedores, telefones, endereços e registros de auditoria.

| Campo | Descrição |
|:---|:---|
| `id_empresa` | Identificador único da empresa (**Chave Primária – PK**). |
| `cnpj` | Cadastro Nacional da Pessoa Jurídica, utilizado para identificar a empresa. |
| `razao_social` | Denominação jurídica da empresa. |
| `email` | Endereço de e-mail para contato. |
| `data_cadastro` | Data em que a empresa foi registrada no sistema. |

### 3. Telefone

Armazena os números de telefone associados às empresas, permitindo registrar múltiplos contatos para uma mesma organização e identificar a finalidade ou classificação de cada número.

| Campo | Descrição |
|:---|:---|
| `id_telefone` | Identificador único do telefone (**Chave Primária – PK**). |
| `ddd` | Código de Discagem Direta à Distância. |
| `numero` | Número telefônico associado à empresa. |
| `tipo` | Classificação do telefone, como comercial, celular ou residencial. |

### 4. Endereço

Armazena as informações de localização das empresas, permitindo identificar seus endereços por meio de dados postais e informações de logradouro.

| Campo | Descrição |
|:---|:---|
| `id_endereco` | Identificador único do endereço (**Chave Primária – PK**). |
| `cep` | Código de Endereçamento Postal. |
| `logradouro` | Nome da rua, avenida ou via. |
| `bairro` | Bairro onde a empresa está localizada. |
| `cidade` | Município correspondente ao endereço. |
| `uf` | Unidade Federativa do endereço. |

### 5. Auditoria

Responsável por armazenar os registros de auditoria relacionados aos dados das empresas. Permite acompanhar alterações e tratamentos realizados nas informações, preservando o histórico dos valores originais e tratados, bem como os critérios e as fontes utilizados no processo.

| Campo | Descrição |
|:---|:---|
| `id_auditoria` | Identificador único do registro de auditoria (**Chave Primária – PK**). |
| `campo` | Nome do campo que passou por alteração ou tratamento. |
| `valor_original` | Valor da informação antes do tratamento. |
| `valor_tratado` | Valor da informação após o tratamento. |
| `criterio` | Regra ou critério utilizado para realizar o tratamento. |
| `fonte` | Origem da informação utilizada no processo. |
### Relacionamentos e Cardinalidades

Os relacionamentos definem como as entidades se conectam no banco de dados, estabelecendo as regras de associação entre os registros.

| Relacionamento | Cardinalidade | Descrição |
|:---|:---:|:---|
| Vendedor — Empresa | 1:N | Um vendedor pode atender várias empresas, enquanto cada empresa está vinculada a um único vendedor. |
| Empresa — Telefone | 1:N | Uma empresa pode possuir vários telefones, enquanto cada telefone pertence a uma única empresa. |
| Empresa — Endereço | 1:1 | Cada empresa possui um endereço, e cada endereço está associado exclusivamente a uma empresa. |
| Empresa — Auditoria | 1:N | Uma empresa pode possuir vários registros de auditoria, enquanto cada registro de auditoria pertence a uma única empresa. |

### Campos Críticos 

| Elemento | Campos relacionados | Importância |
|:---|:---|:---|
| **Identificação** | `id_*` | Identificam exclusivamente cada registro por meio de chaves primárias (PK). |
| **Dados empresariais** | `cnpj`, `razao_social` | Permitem identificar e diferenciar as empresas cadastradas. |
| **Responsabilidade comercial** | `Vendedor`, `Empresa` | Identifica o vendedor responsável pelo atendimento de cada empresa. |
| **Dados de contato** | `email`, `ddd`, `numero`, `cep`, `logradouro`, `bairro`, `cidade`, `uf` | Permitem a comunicação e a localização das empresas. |
| **Controle cadastral** | `data_cadastro` | Registra a data de inclusão da empresa no sistema. |
| **Auditoria** | `campo`, `valor_original`, `valor_tratado` | Permitem identificar e comparar alterações realizadas nos dados. |
| **Rastreabilidade** | `criterio`, `fonte` | Registram as regras aplicadas e a origem das informações. |


# Documentação da API

### Endpoints Principais

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

Passo a passo para configurar e rodar o projeto em sua máquina.

### 1. Pré-requisitos
É necessário ter as seguintes ferramentas instaladas em seu ambiente de desenvolvimento:
* **Node.js**
* **PostgreSQL**

### 2. Clonagem do Repositório
```bash
git clone https://github.com/SabrinadeQueirozLeite/Empresa-Primora
cd Empresa-Primora
```

### 3. Instalação das Dependências

#### Iniciando o projeto com Node.js
```bash
npm init -y
```

#### Instalando as dependências principais
```bash
npm install bcryptjs csv-parser dotenv express fast-csv jsonwebtoken pg
```

#### Instalando a dependência de desenvolvimento (nodemon)
```bash
npm install -D nodemon
```

### 4. Configuração das Variáveis de Ambiente
Crie um arquivo .env na raiz do projeto e configure as variáveis de acesso ao banco de dados. Ajuste o DB_PORT se o PostgreSQL não utilizar a porta padrão.

```env
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=nome_do_banco
DB_HOST=localhost
DB_PORT=5432
```

### 5. Configuração do Banco de Dados
Crie o banco de dados no PostgreSQL e execute o script SQL de modelagem (localizado na pasta `sql/`) para estruturar as tabelas e relacionamentos necessários para o funcionamento do ETL e da aplicação.

### 6. Execução da Aplicação
Com as tabelas do banco já criadas, execute o pipeline ETL.

```bash
npm run etl
```
```bash
npm run api
```

O processo lê `ETL/data/clientes_distribuidora_vetor.csv`, normaliza os dados e
grava empresas, vendedores, telefones e endereços em uma única transação. As
empresas existentes são atualizadas quando o ETL é executado novamente.
