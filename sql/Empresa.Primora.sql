-- crie o banco com nome : Empresa_Primora 
-- Edite o .env com a senha que você escolheu para o postgres
-- primeiro rode a tabela VENDEDOR e depois EMPRESA


CREATE TABLE empresa (
 id_empresa varchar (10),
 cnpj varchar(18) unique,
 razao_social varchar(150)not null,
 email varchar(100),
 data_cadastro date,
 id_vendedor int,
 CONSTRAINT pk_empresa primary key (id_empresa),
 CONSTRAINT fk_empresa_vendedor foreign key (id_vendedor) REFERENCES vendedor(id_vendedor) 
 );
 
 CREATE TABLE endereco(
 id_endereco serial,
 cep char(8),
 logradouro varchar(40),
 complemento varchar(50),
 bairro_informado varchar(40),
 cidade varchar(40),
 uf char(2),
 id_empresa varchar(10),
 CONSTRAINT pk_endereco primary key (id_endereco),
 CONSTRAINT fk_edereco_empresa foreign key (id_empresa) REFERENCES empresa(id_empresa)
);


CREATE TABLE vendedor (
id_vendedor serial unique,
nome varchar (50),
CONSTRAINT pk_vendedor primary key (id_vendedor)
);


CREATE TABLE telefone (
  id_telefone int unique,
  id_empresa varchar(10),
  ddd char(2),
  numero varchar(10) not null,
  tipo varchar(10),
  CONSTRAINT chk_tipo_telefone CHECK (tipo IN ('Fixo', 'Celular')),
  CONSTRAINT pk_telefone primary key (id_telefone),
  CONSTRAINT fk_telefone_empresa foreign key (id_empresa) REFERENCES empresa(id_empresa)
);


CREATE TABLE auditoria(
id_auditoria serial,
id_empresa varchar(10),
campo varchar(50),
valor_original varchar(50),
valor_tratado varchar(50),
criterio varchar(50),
fonte varchar(50),
CONSTRAINT pk_auditoria primary key (id_auditoria),
CONSTRAINT fk_auditoria_empresa foreign key (id_empresa) REFERENCES empresa(id_empresa)
);