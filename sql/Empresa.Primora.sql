-- crie o banco com nome : Empresa_Primora 
-- Edite o .env com a senha que você escolheu para o postgres

CREATE TABLE cliente (
 id_cliente varchar (10),
 cnpj varchar(18) unique,
 razao_social varchar(150)not null,
 email varchar(100),
 cep char(8) not null,
 bairro varchar(40),
 cidade varchar(40),
 uf char(2),
 data_cadastro date,
 id_vendedor int,
 CONSTRAINT pk_cliente primary key (id_cliente),
 CONSTRAINT fk_cliente_vendedor foreign key (id_vendedor) REFERENCES vendedor(id_vendedor) 
 );

CREATE TABLE vendedor (
id_vendedor serial unique,
nome varchar (50),
CONSTRAINT pk_vendedor primary key (id_vendedor)
);


CREATE TABLE telefone (
  id_telefone int unique,
  ddd char(2),
  numero varchar(10) not null,
  tipo varchar(10) CONSTRAINT chk_tipo_telefone CHECK (tipo IN ('Fixo', 'Celular'))
);

CREATE TABLE auditoria(
id_auditoria serial,
id_cliente varchar(10),
campo varchar(50),
valor_original varchar(50),
valor_tratado varchar(50),
criterio varchar(50),
fonte varchar(50),
CONSTRAINT pk_auditoria primary key (id_auditoria),
CONSTRAINT fk_auditoria_cliente foreign key (id_cliente) REFERENCES cliente(id_cliente)
);
