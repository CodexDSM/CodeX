-- =============================================
-- Sistema de Gestão de Fretes - Banco de Dados
-- =============================================

DROP SCHEMA IF EXISTS sistema_fretes;
CREATE SCHEMA sistema_fretes DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_fretes;

-- -----------------------------------------------------
-- Tabela: colaborador
-- -----------------------------------------------------
CREATE TABLE colaborador (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf CHAR(14) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(15),
    perfil ENUM('Administrador', 'Gerente', 'Operador', 'Motorista') DEFAULT 'Operador',
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
CREATE TABLE cliente (
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
CREATE TABLE veiculo (
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
CREATE TABLE motorista (
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
-- Tabela: frete
-- -----------------------------------------------------
CREATE TABLE frete (
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
CREATE TABLE rastreamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    frete_id INT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    registrado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (frete_id) REFERENCES frete(id) ON DELETE CASCADE,
    INDEX idx_frete_data (frete_id, registrado_em)
);

-- -----------------------------------------------------
-- Dados iniciais
-- -----------------------------------------------------
INSERT INTO colaborador (nome, cpf, email, senha, telefone, perfil, logradouro, numero, bairro, cidade, uf, cep) 
VALUES ('Administrador', '000.000.000-00', 'admin@sistema.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '11999999999', 'Administrador', 'Rua Sistema', '1', 'Centro', 'São Paulo', 'SP', '01000-000');

-- -----------------------------------------------------
-- View: resumo de fretes
-- -----------------------------------------------------
CREATE VIEW vw_resumo_fretes AS
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