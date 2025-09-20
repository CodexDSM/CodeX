-- =============================================
-- Sistema de Gestão Newe - Banco de Dados
-- =============================================

CREATE SCHEMA IF NOT EXISTS newe_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE newe_db;

-- -----------------------------------------------------
-- Tabela: colaborador
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS colaborador (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf CHAR(14) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(15),
    perfil ENUM('Administrador', 'Gerente', 'Operador', 'Motorista', 'Comercial') DEFAULT 'Operador',
    ativo BOOLEAN DEFAULT TRUE,
    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    complemento VARCHAR(50),
    bairro VARCHAR(60) NOT NULL,
    cidade VARCHAR(60) NOT NULL,
    uf CHAR(2) NOT NULL,
    cep CHAR(9) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nome (nome),
    INDEX idx_ativo (ativo)
);

-- -----------------------------------------------------
-- Tabela: cliente
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_pessoa ENUM('F', 'J') NOT NULL,
    nome VARCHAR(150) NOT NULL,
    documento CHAR(18) UNIQUE NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(15) NOT NULL,
    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    complemento VARCHAR(50),
    bairro VARCHAR(60) NOT NULL,
    cidade VARCHAR(60) NOT NULL,
    uf CHAR(2) NOT NULL,
    cep CHAR(9) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_nome (nome),
    INDEX idx_tipo (tipo_pessoa)
);

-- -----------------------------------------------------
-- Tabela: veiculo
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS veiculo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa CHAR(8) UNIQUE NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    capacidade_kg DECIMAL(10,2) NOT NULL,
    tipo ENUM('Caminhão', 'Carreta', 'Van', 'Utilitário') NOT NULL,
    disponivel BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Tabela: motorista
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS motorista (
    colaborador_id INT PRIMARY KEY,
    cnh VARCHAR(20) UNIQUE NOT NULL,
    categoria_cnh VARCHAR(5) NOT NULL,
    validade_cnh DATE NOT NULL,
    veiculo_id INT,
    FOREIGN KEY (colaborador_id) REFERENCES colaborador(id) ON DELETE CASCADE,
    FOREIGN KEY (veiculo_id) REFERENCES veiculo(id) ON DELETE SET NULL,
    INDEX idx_veiculo (veiculo_id)
);

-- -----------------------------------------------------
-- Tabela: agregados
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS agregados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_motorista VARCHAR(255) NOT NULL,
    cnh VARCHAR(20) NOT NULL UNIQUE,
    placa_veiculo VARCHAR(10) NOT NULL UNIQUE,
    modelo_veiculo VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cnh (cnh),
    INDEX idx_placa (placa_veiculo),
    INDEX idx_email (email)
);

-- -----------------------------------------------------
-- Tabela: frete
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS frete (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    cliente_id INT NOT NULL,
    colaborador_id INT NOT NULL,
    motorista_id INT,
    veiculo_id INT,
    origem_cidade VARCHAR(60) NOT NULL,
    origem_uf CHAR(2) NOT NULL,
    destino_cidade VARCHAR(60) NOT NULL,
    destino_uf CHAR(2) NOT NULL,
    distancia_km DECIMAL(8,2),
    valor DECIMAL(10,2) NOT NULL,
    peso_kg DECIMAL(10,3),
    status ENUM('Aguardando', 'Coletado', 'Transito', 'Entregue', 'Cancelado') DEFAULT 'Aguardando',
    data_coleta DATE NOT NULL,
    data_entrega_prevista DATE NOT NULL,
    data_entrega DATE,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id),
    FOREIGN KEY (colaborador_id) REFERENCES colaborador(id),
    FOREIGN KEY (motorista_id) REFERENCES motorista(colaborador_id),
    FOREIGN KEY (veiculo_id) REFERENCES veiculo(id),
    INDEX idx_cliente (cliente_id),
    INDEX idx_status (status),
    INDEX idx_datas (data_coleta, data_entrega_prevista)
);

-- -----------------------------------------------------
-- Tabela: rastreamento
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS rastreamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    frete_id INT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    registrado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (frete_id) REFERENCES frete(id) ON DELETE CASCADE,
    INDEX idx_frete_data (frete_id, registrado_em)
);

-- -----------------------------------------------------
-- Tabela: interacao_cliente
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS interacao_cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    colaborador_id INT NOT NULL,
    cliente_id INT NOT NULL,
    tipo_interacao ENUM('Ligação', 'E-mail', 'Reunião Presencial', 'Mensagem', 'Outro') NOT NULL,
    data_interacao DATETIME NOT NULL,
    assunto VARCHAR(255),
    detalhes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (colaborador_id) REFERENCES colaborador(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE CASCADE,
    INDEX idx_colaborador (colaborador_id),
    INDEX idx_cliente (cliente_id),
    INDEX idx_data (data_interacao)
);

-- -----------------------------------------------------
-- Dados iniciais
-- -----------------------------------------------------
INSERT INTO colaborador (nome, cpf, email, senha, telefone, perfil, logradouro, numero, bairro, cidade, uf, cep) 
VALUES ('Administrador', '000.000.000-00', 'admin@sistema.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '11999999999', 'Administrador', 'Rua Sistema', '1', 'Centro', 'São Paulo', 'SP', '01000-000');

-- -----------------------------------------------------
-- View: resumo de fretes
-- -----------------------------------------------------
CREATE OR REPLACE VIEW vw_resumo_fretes AS
SELECT 
    f.id,
    f.codigo,
    c.nome AS cliente,
    c.documento,
    col.nome AS responsavel,
    COALESCE(m.colaborador_id, 0) AS motorista_id,
    COALESCE(mot.nome, 'Não atribuído') AS motorista,
    COALESCE(v.placa, 'Sem veículo') AS veiculo,
    f.status,
    CONCAT(f.origem_cidade, '/', f.origem_uf) AS origem,
    CONCAT(f.destino_cidade, '/', f.destino_uf) AS destino,
    f.valor,
    f.data_coleta,
    f.data_entrega_prevista,
    f.data_entrega
FROM frete f
JOIN cliente c ON f.cliente_id = c.id
JOIN colaborador col ON f.colaborador_id = col.id
LEFT JOIN motorista m ON f.motorista_id = m.colaborador_id
LEFT JOIN colaborador mot ON m.colaborador_id = mot.id
LEFT JOIN veiculo v ON f.veiculo_id = v.id;

-- -----------------------------------------------------
-- Adicionar dados adicionais e atualizar senhas
-- -----------------------------------------------------
SELECT * FROM COLABORADOR;

INSERT INTO colaborador (
    nome, cpf, email, senha, telefone, perfil, 
    logradouro, numero, bairro, cidade, uf, cep
) 
VALUES (
    'Administrador 2',
    '000.000.000-01',
    'admin1@sistema.com',
    '12345',
    '12999999999',
    'Administrador',
    'Rua Sistema 2', '11', 'Ceentro', 'São Paulo', 'SP', '11000-000'
);

USE newe_db;
SELECT * FROM cliente;
SELECT * FROM colaborador;
SELECT * FROM agregados;

UPDATE colaborador 
SET senha = '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq'
WHERE email = 'admin@sistema.com';

UPDATE colaborador 
SET senha = '$2b$10$spjldKZz9E7KxfHpEYtDgOfDz9w69eE6OGTs.2nDrloeP.AmUEOi.'
WHERE email = 'admin1@sistema.com';