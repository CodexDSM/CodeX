-- =============================================
-- SISTEMA DE GESTÃO NEWE - BANCO DE DADOS
-- =============================================

CREATE SCHEMA newe_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE newe_db;

-- =============================================
-- TABELAS PRINCIPAIS
-- =============================================

-- Colaboradores (usuários do sistema)
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

-- Clientes
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

-- Veículos da frota
CREATE TABLE veiculo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa CHAR(8) UNIQUE NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    capacidade_kg DECIMAL(10,2) NOT NULL,
    tipo ENUM('Caminhão', 'Carreta', 'Van', 'Utilitário') NOT NULL,
    disponivel BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- RELACIONAMENTOS
-- =============================================

-- Motoristas (especialização de colaborador)
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

-- Motoristas terceirizados
CREATE TABLE agregados (
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

-- =============================================
-- SISTEMA DE LOCALIZAÇÃO
-- =============================================

-- Controle de presença dos colaboradores
CREATE TABLE localizacao_colaborador (
    id INT AUTO_INCREMENT PRIMARY KEY,
    colaborador_id INT NOT NULL,
    tipo_localizacao ENUM('Presencial', 'Home_Office', 'Evento', 'Treinamento') NOT NULL,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (colaborador_id) REFERENCES colaborador(id) ON DELETE CASCADE,
    INDEX idx_colaborador_data (colaborador_id, data_hora DESC)
);

-- =============================================
-- SISTEMA DE FRETES
-- =============================================

-- Fretes/transportes
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

-- Rastreamento GPS dos fretes
CREATE TABLE rastreamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    frete_id INT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    registrado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (frete_id) REFERENCES frete(id) ON DELETE CASCADE,
    INDEX idx_frete_data (frete_id, registrado_em)
);

-- =============================================
-- SISTEMA DE CRM
-- =============================================

-- Histórico de interações com clientes
CREATE TABLE interacao_cliente (
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

-- =============================================
-- SISTEMA DE CHECKLIST
-- =============================================

-- Modelos de checklist
CREATE TABLE checklist_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Banco de perguntas
CREATE TABLE checklist_perguntas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    texto_pergunta VARCHAR(255) NOT NULL,
    tipo_pergunta ENUM('TEXTO', 'TEXTO_LONGO', 'NUMERO', 'SIM_NAO', 'DATA', 'ARQUIVO') NOT NULL,
    ativo BOOLEAN DEFAULT TRUE
);

-- Relacionamento template-pergunta
CREATE TABLE template_perguntas (
    template_id INT NOT NULL,
    pergunta_id INT NOT NULL,
    ordem_exibicao INT,
    obrigatoria BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (template_id, pergunta_id),
    FOREIGN KEY (template_id) REFERENCES checklist_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (pergunta_id) REFERENCES checklist_perguntas(id) ON DELETE CASCADE
);

-- Registros preenchidos
CREATE TABLE registros_checklist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    template_id INT NOT NULL,
    colaborador_id INT NOT NULL,
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo_relacionado_id VARCHAR(255),
    FOREIGN KEY (template_id) REFERENCES checklist_templates(id),
    FOREIGN KEY (colaborador_id) REFERENCES colaborador(id)
);

-- Respostas dos checklists
CREATE TABLE checklist_respostas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    registro_id INT NOT NULL,
    pergunta_id INT NOT NULL,
    valor_resposta TEXT,
    FOREIGN KEY (registro_id) REFERENCES registros_checklist(id) ON DELETE CASCADE,
    FOREIGN KEY (pergunta_id) REFERENCES checklist_perguntas(id)
);

-- Arquivos anexados
CREATE TABLE registros_anexos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    registro_id INT NOT NULL,
    caminho_arquivo VARCHAR(255) NOT NULL,
    nome_original_arquivo VARCHAR(255),
    enviado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registro_id) REFERENCES registros_checklist(id) ON DELETE CASCADE
);

-- =============================================
-- VIEW PARA RELATÓRIOS
-- =============================================

-- Resumo completo dos fretes
CREATE VIEW vw_resumo_fretes AS
SELECT 
    f.id, f.codigo, c.nome AS cliente, c.documento,
    col.nome AS responsavel, COALESCE(m.colaborador_id, 0) AS motorista_id,
    COALESCE(mot.nome, 'Não atribuído') AS motorista,
    COALESCE(v.placa, 'Sem veículo') AS veiculo, f.status,
    CONCAT(f.origem_cidade, '/', f.origem_uf) AS origem,
    CONCAT(f.destino_cidade, '/', f.destino_uf) AS destino,
    f.valor, f.data_coleta, f.data_entrega_prevista, f.data_entrega
FROM frete f
JOIN cliente c ON f.cliente_id = c.id
JOIN colaborador col ON f.colaborador_id = col.id
LEFT JOIN motorista m ON f.motorista_id = m.colaborador_id
LEFT JOIN colaborador mot ON m.colaborador_id = mot.id
LEFT JOIN veiculo v ON f.veiculo_id = v.id;

-- =============================================
-- DADOS INICIAIS
-- =============================================

-- Colaboradores administradores
INSERT INTO colaborador (nome, cpf, email, senha, telefone, perfil, logradouro, numero, bairro, cidade, uf, cep) 
VALUES 
('Administrador', '000.000.000-00', 'admin@sistema.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11999999999', 'Administrador', 'Rua Sistema', '1', 'Centro', 'São Paulo', 'SP', '01000-000'),
('Administrador 2', '000.000.000-01', 'admin1@sistema.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '12999999999', 'Administrador', 'Rua Sistema 2', '11', 'Centro', 'São Paulo', 'SP', '11000-000');

-- Templates de checklist
INSERT INTO checklist_templates (id, nome, descricao) VALUES
(1, 'Checklist Diário - Frota Newe', 'Checklist para motoristas da frota própria'),
(2, 'Formulário de Abertura', 'Procedimentos de abertura diária'),
(3, 'Formulário de Fechamento', 'Procedimentos de fechamento diário'),
(4, 'Formulário de Manutenção Predial', 'Verificação das condições prediais');

-- Perguntas do checklist
INSERT INTO checklist_perguntas (id, texto_pergunta, tipo_pergunta) VALUES
(1, 'Nome do Motorista', 'TEXTO'), (2, 'Placa do Veículo', 'TEXTO'),
(3, 'Data do Check-List', 'DATA'), (4, 'KM Inicial', 'NUMERO'),
(5, 'Destino', 'TEXTO'), (6, 'KM Final', 'NUMERO'),
(7, 'Teve Abastecimento?', 'SIM_NAO'), (8, 'Comprovante enviado?', 'SIM_NAO'),
(9, 'Óleo do Motor ok?', 'SIM_NAO'), (10, 'Reservatório de Água ok?', 'SIM_NAO'),
(11, 'Sistema Elétrico ok?', 'SIM_NAO'), (12, 'Estado dos Pneus ok?', 'SIM_NAO'),
(13, 'Limpeza ok?', 'SIM_NAO'), (14, 'Observações', 'TEXTO_LONGO'),
(15, 'Anexar Fotos', 'ARQUIVO'), (16, 'Quem está preenchendo?', 'TEXTO'),
(17, 'Data de abertura?', 'DATA'), (18, 'Abriu cadeado?', 'SIM_NAO'),
(19, 'Desbloqueou alarme?', 'SIM_NAO'), (20, 'Ligou TV?', 'SIM_NAO'),
(21, 'Coletou chaves?', 'SIM_NAO'), (22, 'Removeu cadeado portão?', 'SIM_NAO'),
(23, 'Posicionou cone PCD?', 'SIM_NAO'), (24, 'Fez café?', 'SIM_NAO'),
(25, 'Situação atípica?', 'TEXTO_LONGO');

-- Relacionamentos template-pergunta
INSERT INTO template_perguntas (template_id, pergunta_id, ordem_exibicao, obrigatoria) VALUES
(1, 1, 10, true), (1, 2, 20, true), (1, 3, 30, true), (1, 4, 40, true),
(1, 5, 50, true), (1, 6, 60, true), (1, 7, 70, false), (1, 8, 80, false),
(1, 9, 90, true), (1, 10, 100, true), (1, 11, 110, true), (1, 12, 120, true),
(1, 13, 130, true), (1, 14, 140, false), (1, 15, 150, false),
(2, 16, 10, true), (2, 17, 20, true), (2, 18, 30, true), (2, 19, 40, true),
(2, 20, 50, true), (2, 21, 60, true), (2, 22, 70, true), (2, 23, 80, false),
(2, 24, 90, true), (2, 25, 100, false);


INSERT INTO cliente (
  tipo_pessoa, nome, documento, email, telefone, logradouro, numero, bairro, cidade, uf, cep
) VALUES
('F', 'João da Silva', '123.456.789-00', 'joao@email.com', '11988887777', 'Rua Azul', '10', 'Centro', 'São Paulo', 'SP', '01200-000'),
('J', 'Empresa Alpha LTDA', '12.345.678/0001-99', 'contato@alpha.com.br', '11988880000', 'Av. Paulista', '1000', 'Bela Vista', 'São Paulo', 'SP', '01310-000'),
('F', 'Maria Oliveira', '987.654.321-00', 'maria@exemplo.com', '11991234567', 'Rua Verde', '102', 'Jardins', 'São Paulo', 'SP', '01490-000'),
('J', 'Beta Logística S/A', '22.444.888/0001-55', 'comercial@betalogi.com.br', '1125643000', 'Rua dos Transportes', '101', 'Parque Novo', 'Barueri', 'SP', '06465-300'),
('F', 'Carlos Pereira', '789.123.456-00', 'carlospereira@gmail.com', '11987654321', 'Av. Brasil', '500', 'Jabaquara', 'São Paulo', 'SP', '04345-030');

INSERT INTO interacao_cliente (
  colaborador_id, cliente_id, tipo_interacao, data_interacao, assunto, detalhes
) VALUES
(1, 1, 'E-mail', '2025-09-21 09:15:00', 'Envio de Proposta', 'Envio de proposta comercial referente ao transporte de cargas'),
(2, 2, 'Ligação', '2025-09-21 10:30:00', 'Negociação de valores', 'Negociação de valores do contrato anual'),
(1, 3, 'Mensagem', '2025-09-22 15:42:00', 'Dúvida sobre coleta', 'Cliente perguntou horário limite para coleta'),
(2, 4, 'Reunião Presencial', '2025-09-23 11:00:00', 'Apresentação de sistema', 'Demonstração do sistema de gestão para diretoria Beta Logística'),
(1, 2, 'E-mail', '2025-09-24 08:30:00', 'Envio de checklist', 'Checklist de frete enviado ao cliente'),
(2, 5, 'Outro', '2025-09-20 17:00:00', 'Atendimento pós-venda', 'Cliente relatou elogios ao atendimento e pediu programa de fidelidade'),
(1, 4, 'Mensagem', '2025-09-23 16:45:00', 'Dúvida sobre documento', 'Cliente solicitou segunda via da nota de transporte'),
(2, 3, 'Ligação', '2025-09-24 19:02:00', 'Cobrança de inadimplente', 'Contato para cobrança de parcela em atraso'),
(1, 5, 'E-mail', '2025-09-24 10:21:00', 'Envio de contrato', 'Contrato formal enviado ao cliente via e-mail');


INSERT INTO veiculo (
  placa, modelo, capacidade_kg, tipo
) VALUES
('ABC1D23', 'Mercedes Actros', 12000.00, 'Caminhão'),
('DEF4G56', 'Volkswagen Delivery', 3000.00, 'Van'),
('HIJ7K89', 'Volvo FH', 18000.00, 'Carreta');

INSERT INTO frete (
  codigo, cliente_id, colaborador_id, veiculo_id, origem_cidade, origem_uf, destino_cidade, destino_uf, valor, data_coleta, data_entrega_prevista
) VALUES
('FRT0001', 1, 1, 1, 'São Paulo', 'SP', 'Campinas', 'SP', 1500.00, '2025-09-28', '2025-09-29'),
('FRT0002', 2, 2, 3, 'Santos', 'SP', 'Ribeirão Preto', 'SP', 2500.00, '2025-09-25', '2025-09-26');



-- Verificação
SELECT 'Banco Newe criado com sucesso!' as status;

SELECT COUNT(*) FROM colaborador;
SELECT COUNT(*) FROM cliente;

INSERT INTO colaborador (nome, cpf, email, senha, telefone, perfil, logradouro, numero, complemento, bairro, cidade, uf, cep) VALUES
('Ana Silva Santos', '428.433.255-44', 'anasilvasantos226@uol.com.br', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11946456998', 'Gerente', 'Rua XV de Novembro', '6394', 'Bloco A', 'Centro', 'São Paulo', 'SP', '01013-000'),
('Carlos Eduardo Lima', '727.626.436-00', 'carloseduardolima767@outlook.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11933354871', 'Operador', 'Rua XV de Novembro', '2797', 'Sala 203', 'Centro', 'São Paulo', 'SP', '01013-000'),
('Maria José Oliveira', '349.222.394-05', 'mariajoseoliveira461@outlook.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11921977675', 'Administrador', 'Avenida Faria Lima', '3887', 'Sala 203', 'Itaim Bibi', 'São Paulo', 'SP', '04538-000'),
('João Pedro Souza', '720.954.329-59', 'joaopedrosouza218@gmail.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11970838345', 'Motorista', 'Avenida Ibirapuera', '1374', NULL, 'Moema', 'São Paulo', 'SP', '04029-000'),
('Fernanda Costa Almeida', '031.306.387-76', 'fernandacostaalmeida470@uol.com.br', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11994806311', 'Motorista', 'Rua Barão de Itapetininga', '8681', 'Apto 101', 'República', 'São Paulo', 'SP', '01042-000'),
('Rafael Gonçalves', '332.917.525-70', 'rafaelgoncalves70@uol.com.br', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11920089122', 'Operador', 'Avenida Rebouças', '7149', NULL, 'Pinheiros', 'São Paulo', 'SP', '05402-000'),
('Juliana Ferreira', '289.416.313-43', 'julianaferreira307@yahoo.com.br', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11981822319', 'Motorista', 'Avenida Faria Lima', '8171', 'Casa 2', 'Itaim Bibi', 'São Paulo', 'SP', '04538-000'),
('Marcos Antonio Rosa', '213.514.949-70', 'marcosantoniorosa921@hotmail.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11975209687', 'Administrador', 'Rua Direita', '3066', 'Casa 2', 'Centro', 'São Paulo', 'SP', '01002-000'),
('Luciana Rodrigues', '071.953.843-22', 'lucianarodrigues632@hotmail.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11939267400', 'Motorista', 'Rua Pamplona', '6702', 'Sala 203', 'Jardim Paulista', 'São Paulo', 'SP', '01405-000'),
('Paulo Henrique Martins', '646.259.746-15', 'paulohenriquemartins865@outlook.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11949369989', 'Administrador', 'Avenida São Luís', '5159', 'Apto 101', 'República', 'São Paulo', 'SP', '01046-000'),
('Camila Barbosa', '664.641.924-85', 'camilabarbosa507@gmail.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11917992486', 'Gerente', 'Avenida Rio Branco', '7377', 'Bloco A', 'Centro', 'São Paulo', 'SP', '01206-000'),
('Diego Santos Silva', '543.283.511-84', 'diegosantossilva682@gmail.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11949787029', 'Administrador', 'Avenida São João', '8820', 'Sala 203', 'República', 'São Paulo', 'SP', '01035-000'),
('Renata Pereira Lima', '512.777.849-14', 'renatapereiralima920@outlook.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11946168757', 'Operador', 'Rua da Consolação', '701', NULL, 'Consolação', 'São Paulo', 'SP', '01302-000'),
('Bruno Carvalho', '310.358.556-07', 'brunocarvalho478@yahoo.com.br', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11954883168', 'Operador', 'Rua Oscar Freire', '8930', 'Sala 203', 'Jardins', 'São Paulo', 'SP', '01426-000'),
('Tatiana Melo', '809.639.312-02', 'tatianamelo864@outlook.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11991734985', 'Operador', 'Rua Oscar Freire', '3469', 'Apto 101', 'Jardins', 'São Paulo', 'SP', '01426-000'),
('André Luiz Campos', '936.615.815-38', 'andreluizcampos55@gmail.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11946031915', 'Gerente', 'Rua Augusta', '9860', 'Sala 203', 'Centro', 'São Paulo', 'SP', '01305-000'),
('Patricia Ribeiro', '601.106.057-99', 'patriciaribeiro589@outlook.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11935363749', 'Gerente', 'Rua da Consolação', '3139', 'Sala 203', 'Consolação', 'São Paulo', 'SP', '01302-000'),
('Rodrigo Alves', '034.855.890-20', 'rodrigoalves450@outlook.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11984347514', 'Operador', 'Rua Estados Unidos', '2036', 'Bloco A', 'Jardim América', 'São Paulo', 'SP', '01427-000'),
('Vanessa Moreira', '186.986.865-08', 'vanessamoreira365@gmail.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11912223103', 'Gerente', 'Rua Oscar Freire', '4295', 'Casa 2', 'Jardins', 'São Paulo', 'SP', '01426-000'),
('Gustavo Henrique Costa', '938.720.807-92', 'gustavohenriquecosta503@gmail.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11933282821', 'Operador', 'Rua da Consolação', '5213', 'Sala 203', 'Consolação', 'São Paulo', 'SP', '01302-000'),
('Priscila Cardoso', '053.178.621-83', 'priscilacardoso483@hotmail.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11994571301', 'Motorista', 'Rua Boa Vista', '7951', NULL, 'Centro', 'São Paulo', 'SP', '01014-000'),
('Leonardo Santos', '095.123.055-77', 'leonardosantos607@outlook.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11965408894', 'Motorista', 'Avenida Rio Branco', '9509', 'Sala 203', 'Centro', 'São Paulo', 'SP', '01206-000'),
('Isabela Monteiro', '869.824.829-28', 'isabelamonteiro728@outlook.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11903946314', 'Gerente', 'Avenida São Luís', '8111', NULL, 'República', 'São Paulo', 'SP', '01046-000'),
('Thiago Nascimento', '485.901.764-10', 'thiagonascimento249@gmail.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11955705376', 'Operador', 'Avenida Paulista', '3492', 'Apto 101', 'Bela Vista', 'São Paulo', 'SP', '01310-100'),
('Amanda Ramos', '866.732.912-65', 'amandaramos333@outlook.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11927218682', 'Motorista', 'Avenida Ipiranga', '3490', 'Sala 203', 'República', 'São Paulo', 'SP', '01046-000'),
('Felipe Augusto', '740.924.299-08', 'felipeaugusto643@yahoo.com.br', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11908937966', 'Motorista', 'Rua Bela Cintra', '1964', 'Casa 2', 'Consolação', 'São Paulo', 'SP', '01415-000'),
('Natália Torres', '843.858.584-11', 'nataliatorres165@outlook.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11973343468', 'Motorista', 'Rua da Consolação', '9922', 'Sala 203', 'Consolação', 'São Paulo', 'SP', '01302-000'),
('Henrique Dias', '056.067.829-01', 'henriquedias351@gmail.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11961262511', 'Operador', 'Avenida Engenheiro Luís Carlos Berrini', '8160', 'Casa 2', 'Brooklin', 'São Paulo', 'SP', '04571-000'),
('Larissa Nunes', '202.252.852-23', 'larissanunes194@outlook.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11954913160', 'Gerente', 'Avenida São João', '4403', 'Bloco A', 'República', 'São Paulo', 'SP', '01035-000'),
('Mateus Vieira', '104.472.214-26', 'mateusvieira442@yahoo.com.br', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11988587401', 'Administrador', 'Rua 25 de Março', '7130', 'Sala 203', 'Sé', 'São Paulo', 'SP', '01021-000'),
('Gabriela Castro', '200.175.859-61', 'gabrielacastro659@uol.com.br', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11925117983', 'Motorista', 'Rua da Consolação', '9999', 'Bloco A', 'Consolação', 'São Paulo', 'SP', '01302-000'),
('Victor Hugo Araújo', '684.359.937-01', 'victorhugoaraujo161@uol.com.br', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11900131953', 'Gerente', 'Avenida São João', '1382', NULL, 'República', 'São Paulo', 'SP', '01035-000'),
('Carolina Machado', '446.503.439-33', 'carolinamachado706@outlook.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11996173389', 'Operador', 'Avenida Rio Branco', '3070', 'Apto 101', 'Centro', 'São Paulo', 'SP', '01206-000'),
('Daniel Rocha', '475.339.591-08', 'danielrocha103@gmail.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11919784787', 'Gerente', 'Avenida Brasil', '262', 'Casa 2', 'Jardim América', 'São Paulo', 'SP', '01431-000'),
('Mariana Correia', '283.991.706-82', 'marianacorreia339@yahoo.com.br', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11908847099', 'Operador', 'Avenida Rebouças', '9540', 'Casa 2', 'Pinheiros', 'São Paulo', 'SP', '05402-000'),
('Lucas Gabriel', '392.624.813-06', 'lucasgabriel207@yahoo.com.br', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11957213243', 'Motorista', 'Rua da Consolação', '8164', NULL, 'Consolação', 'São Paulo', 'SP', '01302-000'),
('Bruna Fernandes', '989.588.712-45', 'brunafernandes664@gmail.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11931179656', 'Operador', 'Rua Pamplona', '1187', 'Bloco A', 'Jardim Paulista', 'São Paulo', 'SP', '01405-000'),
('Guilherme Lopes', '180.451.551-59', 'guilhermelopes705@uol.com.br', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11920797446', 'Motorista', 'Avenida São João', '1306', 'Casa 2', 'República', 'São Paulo', 'SP', '01035-000'),
('Jéssica Reis', '282.236.660-81', 'jessicareis749@hotmail.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11944647291', 'Administrador', 'Avenida São João', '6160', 'Bloco A', 'República', 'São Paulo', 'SP', '01035-000'),
('Fábio Silva', '665.685.096-04', 'fabiosilva181@hotmail.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11913767168', 'Gerente', 'Rua Augusta', '362', 'Casa 2', 'Centro', 'São Paulo', 'SP', '01305-000'),
('Aline Batista', '540.809.550-90', 'alinebatista212@gmail.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11994846615', 'Administrador', 'Avenida Rebouças', '3005', 'Casa 2', 'Pinheiros', 'São Paulo', 'SP', '05402-000'),
('Caio Mendes', '528.983.693-49', 'caiomendes993@gmail.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11919303535', 'Gerente', 'Avenida Rio Branco', '177', 'Casa 2', 'Centro', 'São Paulo', 'SP', '01206-000'),
('Letícia Freitas', '845.691.902-00', 'leticiafreitas673@uol.com.br', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11917253050', 'Operador', 'Rua Direita', '1530', 'Apto 101', 'Centro', 'São Paulo', 'SP', '01002-000'),
('Pedro Lucas', '945.351.567-19', 'pedrolucas719@outlook.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11936965747', 'Motorista', 'Rua Oscar Freire', '7260', 'Casa 2', 'Jardins', 'São Paulo', 'SP', '01426-000'),
('Roberta Cunha', '136.091.922-83', 'robertacunha377@gmail.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11965776050', 'Operador', 'Rua Barão de Itapetininga', '9144', 'Casa 2', 'República', 'São Paulo', 'SP', '01042-000'),
('Murilo Pinto', '520.927.087-40', 'murilopinto115@outlook.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11990814815', 'Operador', 'Rua Barão de Itapetininga', '7514', NULL, 'República', 'São Paulo', 'SP', '01042-000'),
('Bianca Teixeira', '446.137.179-49', 'biancateixeira262@outlook.com', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11960221701', 'Gerente', 'Rua XV de Novembro', '151', 'Bloco A', 'Centro', 'São Paulo', 'SP', '01013-000'),
('Leandro José', '848.773.666-10', 'leandrojose364@yahoo.com.br', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11984787320', 'Gerente', 'Avenida Rio Branco', '4597', 'Casa 2', 'Centro', 'São Paulo', 'SP', '01206-000'),
('Daniela Cruz', '050.330.451-48', 'danielacruz312@uol.com.br', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11933103671', 'Motorista', 'Rua Teodoro Sampaio', '4945', 'Bloco A', 'Pinheiros', 'São Paulo', 'SP', '05405-000'),
('Vinicius Moura', '924.425.974-54', 'viniciusmoura311@yahoo.com.br', '$2b$10$uOVrky6BPwQizQeswoPAXe0ZWXUtR95/umE.cAttVOSNBODLtOyqq', '11949338905', 'Operador', 'Avenida Faria Lima', '6369', 'Sala 203', 'Itaim Bibi', 'São Paulo', 'SP', '04538-000');

INSERT INTO cliente (tipo_pessoa, nome, documento, email, telefone, logradouro, numero, complemento, bairro, cidade, uf, cep) VALUES
('F', 'Ana Carolina Silva', '123.456.789-12', 'anacarolina@gmail.com', '11987654321', 'Rua das Flores', '100', 'Apto 10', 'Vila Madalena', 'São Paulo', 'SP', '05433-000'),
('J', 'Transportes São Paulo LTDA', '12.345.678/0001-90', 'contato@transportesp.com.br', '1133445566', 'Avenida Paulista', '1500', 'Sala 1001', 'Bela Vista', 'São Paulo', 'SP', '01310-100'),
('F', 'Carlos Roberto Santos', '234.567.891-23', 'carlos.santos@hotmail.com', '11976543210', 'Rua Augusta', '750', NULL, 'Centro', 'São Paulo', 'SP', '01305-000'),
('F', 'Maria Fernanda Costa', '345.678.912-34', 'mariafernanda@yahoo.com.br', '11965432109', 'Avenida Faria Lima', '2000', 'Casa 5', 'Itaim Bibi', 'São Paulo', 'SP', '04538-000'),
('J', 'Logística Express S/A', '23.456.789/0001-01', 'comercial@logexpress.com.br', '1144556677', 'Rua Teodoro Sampaio', '500', 'Bloco B', 'Pinheiros', 'São Paulo', 'SP', '05405-000'),
('F', 'João Pedro Oliveira', '456.789.123-45', 'joaopedro@uol.com.br', '11954321098', 'Avenida Rebouças', '1200', 'Apto 50', 'Pinheiros', 'São Paulo', 'SP', '05402-000'),
('F', 'Luciana Rodrigues', '567.891.234-56', 'luciana.rodrigues@gmail.com', '11943210987', 'Rua Oscar Freire', '800', NULL, 'Jardins', 'São Paulo', 'SP', '01426-000'),
('J', 'Comercial Santa Cruz LTDA', '34.567.890/0001-12', 'vendas@santacruz.com.br', '1155667788', 'Avenida São João', '300', 'Sala 201', 'Centro', 'São Paulo', 'SP', '01035-000'),
('F', 'Roberto Silva Martins', '678.912.345-67', 'roberto.martins@outlook.com', '11932109876', 'Rua da Consolação', '900', 'Casa 3', 'Consolação', 'São Paulo', 'SP', '01302-000'),
('F', 'Fernanda Lima Santos', '789.123.456-78', 'fernanda.lima@hotmail.com', '11921098765', 'Avenida Ibirapuera', '1800', 'Apto 150', 'Moema', 'São Paulo', 'SP', '04029-000'),
('J', 'Indústria Metalúrgica ABC S/A', '45.678.901/0001-23', 'industrial@metalurgicaabc.com.br', '1166778899', 'Rua dos Industriários', '2500', NULL, 'Vila Leopoldina', 'São Paulo', 'SP', '05304-000'),
('F', 'Patricia Alves Costa', '891.234.567-89', 'patricia.alves@gmail.com', '11910987654', 'Rua Haddock Lobo', '400', 'Apto 25', 'Cerqueira César', 'São Paulo', 'SP', '01414-000'),
('F', 'Marcos Antonio Silva', '912.345.678-90', 'marcos.antonio@yahoo.com.br', '11909876543', 'Avenida Angélica', '600', NULL, 'Higienópolis', 'São Paulo', 'SP', '01227-000'),
('J', 'Distribuidora Norte S/A', '56.789.012/0001-34', 'distribuicao@norte.com.br', '1177889900', 'Avenida Tiradentes', '1000', 'Galpão 5', 'Luz', 'São Paulo', 'SP', '01102-000'),
('F', 'Juliana Pereira Santos', '123.987.654-01', 'juliana.pereira@uol.com.br', '11998765432', 'Rua Pamplona', '850', 'Casa 10', 'Jardim Paulista', 'São Paulo', 'SP', '01405-000'),
('F', 'Diego Fernandes Costa', '234.876.543-12', 'diego.fernandes@gmail.com', '11987654321', 'Avenida Brasil', '1500', 'Apto 75', 'Jardim América', 'São Paulo', 'SP', '01431-000'),
('J', 'Construtora Paulista LTDA', '67.890.123/0001-45', 'obras@construtorapaulista.com.br', '1188990011', 'Rua Barão de Itapetininga', '200', 'Sala 1501', 'República', 'São Paulo', 'SP', '01042-000'),
('F', 'Camila Barbosa Lima', '345.765.432-23', 'camila.barbosa@outlook.com', '11976543210', 'Avenida São Luís', '750', NULL, 'República', 'São Paulo', 'SP', '01046-000'),
('F', 'Rafael Gonçalves', '456.654.321-34', 'rafael.goncalves@hotmail.com', '11965432109', 'Rua XV de Novembro', '500', 'Sala 805', 'Centro', 'São Paulo', 'SP', '01013-000'),
('J', 'Alimentícia Global S/A', '78.901.234/0001-56', 'suprimentos@alimenticiaglobal.com.br', '1199001122', 'Avenida Marginal Pinheiros', '3000', 'Torre A', 'Vila Olímpia', 'São Paulo', 'SP', '04578-000'),
('F', 'Bruna Fernandes Silva', '567.543.210-45', 'bruna.fernandes@gmail.com', '11954321098', 'Rua Bela Cintra', '900', 'Apto 30', 'Consolação', 'São Paulo', 'SP', '01415-000'),
('F', 'Lucas Gabriel Santos', '678.432.109-56', 'lucas.gabriel@yahoo.com.br', '11943210987', 'Avenida Nove de Julho', '1200', NULL, 'Bela Vista', 'São Paulo', 'SP', '01313-000'),
('J', 'Tecnologia Avançada LTDA', '89.012.345/0001-67', 'contato@tecavancada.com.br', '1100112233', 'Rua Funchal', '500', 'Andar 10', 'Vila Olímpia', 'São Paulo', 'SP', '04551-000'),
('F', 'Gabriela Castro Oliveira', '789.321.098-67', 'gabriela.castro@uol.com.br', '11932109876', 'Avenida Engenheiro Luís Carlos Berrini', '1000', 'Sala 201', 'Brooklin', 'São Paulo', 'SP', '04571-000'),
('F', 'Thiago Nascimento', '890.210.987-78', 'thiago.nascimento@gmail.com', '11921098765', 'Rua Boa Vista', '350', 'Apto 15', 'Centro', 'São Paulo', 'SP', '01014-000'),
('J', 'Farmacêutica Nacional S/A', '90.123.456/0001-78', 'pedidos@farmanacional.com.br', '1122334455', 'Avenida Paulista', '2000', 'Conjunto 1205', 'Bela Vista', 'São Paulo', 'SP', '01310-300'),
('F', 'Amanda Ramos Costa', '901.109.876-89', 'amanda.ramos@hotmail.com', '11910987654', 'Rua Estados Unidos', '700', 'Casa 8', 'Jardim América', 'São Paulo', 'SP', '01427-000'),
('F', 'Felipe Augusto Silva', '012.098.765-90', 'felipe.augusto@outlook.com', '11909876543', 'Rua Direita', '150', NULL, 'Centro', 'São Paulo', 'SP', '01002-000'),
('J', 'Importadora Sul LTDA', '01.234.567/0001-89', 'importacao@sul.com.br', '1133445566', 'Avenida Rio Branco', '800', 'Sala 501', 'Centro', 'São Paulo', 'SP', '01206-000'),
('F', 'Natália Torres Santos', '123.765.432-01', 'natalia.torres@gmail.com', '11998765432', 'Avenida Ipiranga', '1500', 'Apto 90', 'República', 'São Paulo', 'SP', '01046-000'),
('F', 'Henrique Dias Costa', '234.654.321-12', 'henrique.dias@yahoo.com.br', '11987654321', 'Rua 25 de Março', '600', 'Loja 25', 'Sé', 'São Paulo', 'SP', '01021-000'),
('J', 'Serviços Integrados LTDA', '12.345.678/0002-90', 'atendimento@servicosintegrados.com.br', '1144556677', 'Rua Augusta', '1200', 'Sala 302', 'Centro', 'São Paulo', 'SP', '01305-100'),
('F', 'Larissa Nunes Oliveira', '345.543.210-23', 'larissa.nunes@uol.com.br', '11976543210', 'Avenida Faria Lima', '3000', NULL, 'Itaim Bibi', 'São Paulo', 'SP', '04538-100'),
('F', 'Mateus Vieira Santos', '456.432.109-34', 'mateus.vieira@gmail.com', '11965432109', 'Rua Teodoro Sampaio', '1100', 'Casa 12', 'Pinheiros', 'São Paulo', 'SP', '05405-100'),
('J', 'Química Industrial S/A', '23.456.789/0002-01', 'vendas@quimicaindustrial.com.br', '1155667788', 'Avenida das Nações Unidas', '5000', 'Bloco C', 'Brooklin Novo', 'São Paulo', 'SP', '04578-100'),
('F', 'Victor Hugo Araújo', '567.321.098-45', 'victor.hugo@hotmail.com', '11954321098', 'Rua Pamplona', '950', 'Apto 45', 'Jardim Paulista', 'São Paulo', 'SP', '01405-100'),
('F', 'Carolina Machado Silva', '678.210.987-56', 'carolina.machado@outlook.com', '11943210987', 'Avenida Rebouças', '1800', NULL, 'Pinheiros', 'São Paulo', 'SP', '05402-100'),
('J', 'Textil Moderna LTDA', '34.567.890/0002-12', 'comercial@textilmoderna.com.br', '1166778899', 'Rua do Brás', '800', 'Galpão 10', 'Brás', 'São Paulo', 'SP', '03016-000'),
('F', 'Daniel Rocha Santos', '789.109.876-67', 'daniel.rocha@gmail.com', '11932109876', 'Avenida Ibirapuera', '2200', 'Apto 120', 'Moema', 'São Paulo', 'SP', '04029-100'),
('F', 'Mariana Correia Lima', '890.098.765-78', 'mariana.correia@yahoo.com.br', '11921098765', 'Rua Oscar Freire', '1200', 'Casa 15', 'Jardins', 'São Paulo', 'SP', '01426-100'),
('J', 'Consultoria Empresarial S/A', '45.678.901/0002-23', 'consultoria@empresarial.com.br', '1177889900', 'Avenida Paulista', '2500', 'Andar 20', 'Bela Vista', 'São Paulo', 'SP', '01310-400'),
('F', 'Guilherme Lopes Costa', '901.987.654-89', 'guilherme.lopes@uol.com.br', '11910987654', 'Rua da Consolação', '1500', NULL, 'Consolação', 'São Paulo', 'SP', '01302-100'),
('F', 'Jéssica Reis Santos', '012.876.543-90', 'jessica.reis@gmail.com', '11909876543', 'Avenida Angélica', '900', 'Apto 65', 'Higienópolis', 'São Paulo', 'SP', '01227-100'),
('J', 'Eletrônicos Premium LTDA', '56.789.012/0002-34', 'vendas@eletronicospremium.com.br', '1188990011', 'Rua Santa Ifigênia', '400', 'Loja 50', 'Santa Ifigênia', 'São Paulo', 'SP', '01207-000'),
('F', 'Fábio Silva Oliveira', '123.654.321-01', 'fabio.silva@hotmail.com', '11998765432', 'Avenida São João', '1800', 'Sala 15', 'Centro', 'São Paulo', 'SP', '01035-100'),
('F', 'Aline Batista Santos', '234.543.210-12', 'aline.batista@outlook.com', '11987654321', 'Rua Bela Cintra', '1500', 'Casa 20', 'Consolação', 'São Paulo', 'SP', '01415-100'),
('J', 'Automotiva Brasil S/A', '67.890.123/0002-45', 'pecas@automotivabrasil.com.br', '1199001122', 'Avenida do Estado', '3500', 'Complexo Industrial', 'Ipiranga', 'São Paulo', 'SP', '04266-000'),
('F', 'Caio Mendes Costa', '345.432.109-23', 'caio.mendes@gmail.com', '11976543210', 'Rua Haddock Lobo', '800', NULL, 'Cerqueira César', 'São Paulo', 'SP', '01414-100'),
('F', 'Letícia Freitas Silva', '456.321.098-34', 'leticia.freitas@yahoo.com.br', '11965432109', 'Avenida Brasil', '2000', 'Apto 80', 'Jardim América', 'São Paulo', 'SP', '01431-100'),
('J', 'Comunicações Digitais LTDA', '78.901.234/0002-56', 'contato@comunicacoesdigitais.com.br', '1100112233', 'Rua Funchal', '800', 'Torre B', 'Vila Olímpia', 'São Paulo', 'SP', '04551-100'),
('F', 'Pedro Lucas Santos', '567.210.987-45', 'pedro.lucas@uol.com.br', '11954321098', 'Avenida Marginal Pinheiros', '4000', 'Casa 25', 'Vila Olímpia', 'São Paulo', 'SP', '04578-200');


DELETE FROM colaborador WHERE id > 10;
DELETE FROM cliente WHERE id > 10;


INSERT INTO interacao_cliente (colaborador_id, cliente_id, tipo_interacao, data_interacao, assunto, detalhes) VALUES
(1, 3, 'Ligação', '2025-09-15 10:30:00', 'Contato inicial de vendas', 'Cliente demonstrou interesse em nossos serviços de consultoria empresarial.'),
(1, 7, 'E-mail', '2025-09-18 14:20:00', 'Follow-up proposta', 'Enviada segunda versão da proposta com ajustes solicitados.'),
(1, 2, 'Reunião Presencial', '2025-09-22 09:00:00', 'Fechamento de negócio', 'Cliente aprovou proposta final e assinou contrato.'),
(2, 5, 'Mensagem', '2025-09-16 16:45:00', 'Suporte técnico', 'Cliente relatou problema no sistema. Solucionado remotamente.'),
(2, 1, 'E-mail', '2025-09-19 12:30:00', 'Atualização de sistema', 'Informado sobre nova funcionalidade disponível no sistema.'),
(80, 4, 'E-mail', '2025-09-17 08:15:00', 'Relatório mensal', 'Enviado relatório de performance do último mês com métricas detalhadas.'),
(80, 6, 'Ligação', '2025-09-19 15:30:00', 'Renovação de contrato', 'Cliente interessado em renovar por mais um ano com expansão de serviços.'),
(80, 8, 'Outro', '2025-09-21 11:00:00', 'Pesquisa de satisfação', 'Aplicada pesquisa via formulário. Cliente muito satisfeito com atendimento.'),
(80, 3, 'Reunião Presencial', '2025-09-24 13:30:00', 'Planejamento estratégico', 'Reunião para definir metas do próximo trimestre.'),
(81, 9, 'Mensagem', '2025-09-20 10:20:00', 'Agendamento de treinamento', 'Cliente solicitou treinamento para nova equipe. Agendado para outubro.'),
(81, 2, 'E-mail', '2025-09-23 16:15:00', 'Documentação técnica', 'Enviada documentação completa do sistema implementado.'),
(82, 7, 'Ligação', '2025-09-25 09:45:00', 'Feedback do produto', 'Cliente compartilhou sugestões de melhorias para próxima versão.'),
(82, 1, 'Reunião Presencial', '2025-09-16 14:00:00', 'Resolução de conflito', 'Mediação entre cliente e equipe técnica. Acordo estabelecido.'),
(82, 5, 'Mensagem', '2025-09-26 11:15:00', 'Confirmação de pagamento', 'Cliente confirmou recebimento da fatura e prazo de pagamento.'),
(83, 10, 'Ligação', '2025-09-17 13:45:00', 'Apresentação de serviços', 'Apresentados novos módulos disponíveis para contratação.'),
(83, 4, 'Outro', '2025-09-20 10:00:00', 'Visita técnica', 'Realizada inspeção no local para avaliação de infraestrutura.'),
(84, 6, 'E-mail', '2025-09-18 15:30:00', 'Proposta comercial', 'Enviada proposta personalizada conforme reunião anterior.'),
(84, 3, 'Mensagem', '2025-09-21 09:20:00', 'Status do projeto', 'Informado progresso atual e próximas etapas do desenvolvimento.'),
(84, 8, 'Reunião Presencial', '2025-09-25 16:00:00', 'Entrega final', 'Apresentação do projeto concluído e treinamento da equipe.'),
(85, 2, 'Ligação', '2025-09-22 08:30:00', 'Acompanhamento mensal', 'Verificação da satisfação com serviços prestados no último mês.'),
(85, 9, 'E-mail', '2025-09-24 14:45:00', 'Relatório de bugs', 'Enviado relatório com correções implementadas na última versão.'),
(86, 1, 'Mensagem', '2025-09-19 17:15:00', 'Configuração inicial', 'Auxiliado cliente na configuração básica do sistema adquirido.'),
(86, 4, 'Ligação', '2025-09-23 11:30:00', 'Suporte emergencial', 'Resolvido problema crítico que impedia operação do cliente.'),
(87, 7, 'Outro', '2025-09-26 13:00:00', 'Auditoria de segurança', 'Realizada verificação completa dos protocolos de segurança implementados.'),
(87, 5, 'E-mail', '2025-09-27 10:15:00', 'Notificação de manutenção', 'Informado sobre janela de manutenção programada para o sistema.');


SELECT id FROM colaborador ORDER BY id;