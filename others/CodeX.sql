CREATE SCHEMA newe_log_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE newe_log_db;

-- =============================================
-- Sistema de Gestão Newe - Banco de Dados
-- =============================================


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
VALUES ('Administrador', '000.000.000-00', 'admin@sistema.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11999999999', 'Administrador', 'Rua Sistema', '1', 'Centro', 'São Paulo', 'SP', '01000-000');

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

SELECT * FROM COLABORADOR;

INSERT INTO colaborador (
    nome, cpf, email, senha, telefone, perfil, 
    logradouro, numero, bairro, cidade, uf, cep
) 
VALUES (
    'Administrador 2',
    '000.000.000-01',
    'admin1@sistema.com',
    '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq',
    '12999999999',
    'Administrador',
    'Rua Sistema 2', '11', 'Ceentro', 'São Paulo', 'SP', '11000-000'
);



CREATE TABLE checklist_templates (
id INT PRIMARY KEY AUTO_INCREMENT,
nome VARCHAR(255) NOT NULL,
descricao TEXT,
ativo BOOLEAN DEFAULT TRUE,
criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE checklist_perguntas (
id INT PRIMARY KEY AUTO_INCREMENT,
texto_pergunta VARCHAR(255) NOT NULL,
tipo_pergunta ENUM('TEXTO', 'TEXTO_LONGO', 'NUMERO', 'SIM_NAO', 'DATA', 'ARQUIVO') NOT NULL,
ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE template_perguntas (
template_id INT NOT NULL,
pergunta_id INT NOT NULL,
ordem_exibicao INT,
obrigatoria BOOLEAN DEFAULT FALSE,
PRIMARY KEY (template_id, pergunta_id),
FOREIGN KEY (template_id) REFERENCES checklist_templates(id) ON DELETE CASCADE,
FOREIGN KEY (pergunta_id) REFERENCES checklist_perguntas(id) ON DELETE CASCADE
);

CREATE TABLE registros_checklist (
id INT PRIMARY KEY AUTO_INCREMENT,
template_id INT NOT NULL,
colaborador_id INT NOT NULL,
data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ativo_relacionado_id VARCHAR(255), -- Ex: A placa de um carro 'ABC-1234'
FOREIGN KEY (template_id) REFERENCES checklist_templates(id),
FOREIGN KEY (colaborador_id) REFERENCES colaborador(id)
);


CREATE TABLE checklist_respostas (
id INT PRIMARY KEY AUTO_INCREMENT,
registro_id INT NOT NULL,
pergunta_id INT NOT NULL,
valor_resposta TEXT,
FOREIGN KEY (registro_id) REFERENCES registros_checklist(id) ON DELETE CASCADE,
FOREIGN KEY (pergunta_id) REFERENCES checklist_perguntas(id)
);

CREATE TABLE registros_anexos (
id INT PRIMARY KEY AUTO_INCREMENT,
registro_id INT NOT NULL,
caminho_arquivo VARCHAR(255) NOT NULL,
nome_original_arquivo VARCHAR(255),
enviado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (registro_id) REFERENCES registros_checklist(id) ON DELETE CASCADE
);


-- INSERÇÃO DE DADOS INICIAIS

INSERT INTO checklist_templates (id, nome, descricao) VALUES
(1, 'Checklist Diário - Frota Newe', 'Checklist para ser preenchido diariamente pelos motoristas da frota própria.'),
(2, 'Formulário de Abertura', 'Procedimentos para a abertura diária da empresa.'),
(3, 'Formulário de Fechamento', 'Procedimentos para o fechamento diário da empresa.'),
(4, 'Formulário de Manutenção Predial', 'Verificação periódica das condições do local de trabalho.');

INSERT INTO checklist_perguntas (id, texto_pergunta, tipo_pergunta) VALUES
(1, 'Nome do Motorista', 'TEXTO'),
(2, 'Placa do Veículo', 'TEXTO'),
(3, 'Data do Check-List', 'DATA'),
(4, 'KM Inicial', 'NUMERO'),
(5, 'Destino', 'TEXTO'),
(6, 'KM Final', 'NUMERO'),
(7, 'Teve Abastecimento?', 'SIM_NAO'),
(8, 'Comprovante de abastecimento Enviado para gerência?', 'SIM_NAO'),
(9, 'Óleo do Motor ok?', 'SIM_NAO'),
(10, 'Reservatório de Água ok?', 'SIM_NAO'),
(11, 'Sistema Elétrico ok?', 'SIM_NAO'),
(12, 'Estado dos Pneus ok?', 'SIM_NAO'),
(13, 'Limpeza Baú/Sider/Cabine ok?', 'SIM_NAO'),
(14, 'Observações que sejam pertinentes', 'TEXTO_LONGO'),
(15, 'Anexar Fotos', 'ARQUIVO'),
(16, 'Quem está preenchendo?', 'TEXTO'),
(17, 'Data de abertura da empresa?', 'DATA'),
(18, 'Abriu cadeado das correntes (FRENTE DA EMPRESA)?', 'SIM_NAO'),
(19, 'Desbloqueou o alarme?', 'SIM_NAO'),
(20, 'Ligou TV (CAMERAS)?', 'SIM_NAO'),
(21, 'Coletou chaves internas no chaveiro?', 'SIM_NAO'),
(22, 'Removeu cadeado portão 1?', 'SIM_NAO'),
(23, 'Posicionou cone no estacionamento PCD?', 'SIM_NAO'),
(24, 'Fez café do dia?', 'SIM_NAO'),
(25, 'Houve alguma situação atípica?', 'TEXTO_LONGO');

INSERT INTO template_perguntas (template_id, pergunta_id, ordem_exibicao, obrigatoria) VALUES
(1, 1, 10, true), (1, 2, 20, true), (1, 3, 30, true), (1, 4, 40, true),
(1, 5, 50, true), (1, 6, 60, true), (1, 7, 70, false), (1, 8, 80, false),
(1, 9, 90, true), (1, 10, 100, true), (1, 11, 110, true), (1, 12, 120, true),
(1, 13, 130, true), (1, 14, 140, false), (1, 15, 150, false),
(2, 16, 10, true), (2, 17, 20, true), (2, 18, 30, true), (2, 19, 40, true),
(2, 20, 50, true), (2, 21, 60, true), (2, 22, 70, true), (2, 23, 80, false),
(2, 24, 90, true), (2, 25, 100, false);


