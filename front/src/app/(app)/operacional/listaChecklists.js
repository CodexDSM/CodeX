export const mockTemplates = [
  { 
    id: 1, 
    name: "Checklist Diário - Frota Newe", 
    description: "Para ser preenchido diariamente pelos motoristas da frota própria.", 
    questions: [
        { id: 1, texto_pergunta: "Nome do Motorista", tipo_pergunta: "TEXTO", obrigatoria: true },
        { id: 2, texto_pergunta: "Placa do Veículo", tipo_pergunta: "TEXTO", obrigatoria: true },
        { id: 3, texto_pergunta: "Data do Check-List", tipo_pergunta: "DATA", obrigatoria: true },
        { id: 4, texto_pergunta: "KM Inicial", tipo_pergunta: "NUMERO", obrigatoria: true },
        { id: 5, texto_pergunta: "Destino", tipo_pergunta: "TEXTO", obrigatoria: true },
        { id: 6, texto_pergunta: "KM Final", tipo_pergunta: "NUMERO", obrigatoria: true },
        { id: 7, texto_pergunta: "Teve Abastecimento?", tipo_pergunta: "SIM_NAO", obrigatoria: false },
        { id: 8, texto_pergunta: "Comprovante de abastecimento enviado para gerência?", tipo_pergunta: "SIM_NAO", obrigatoria: false },       
        { id: 9, texto_pergunta: "Óleo do Motor ok?", tipo_pergunta: "SIM_NAO", obrigatoria: false },
        { id: 10, texto_pergunta: "Reservatório de Água ok?", tipo_pergunta: "SIM_NAO", obrigatoria: false },
        { id: 11, texto_pergunta: "Sistema Elétrico ok?", tipo_pergunta: "SIM_NAO", obrigatoria: false }, 
        { id: 12, texto_pergunta: "Estado dos Pneus ok?", tipo_pergunta: "SIM_NAO", obrigatoria: false },         
        { id: 13, texto_pergunta: "Limpeza Baú/Sider/Cabine ok ?", tipo_pergunta: "SIM_NAO", obrigatoria: false }, 
        { id: 14, texto_pergunta: "Observações que sejam pertinentes", tipo_pergunta: "TEXTO_LONGO", obrigatoria: false },
        { id: 15, texto_pergunta: "Anexar Fotos", tipo_pergunta: "ARQUIVO", obrigatoria: false },
    ]
  },
  { 
    id: 2, 
    name: "Formulário de Abertura da Empresa", 
    description: "Procedimentos para a abertura diária da empresa.", 
    questions: [
        { id: 16, texto_pergunta: "Quem está preenchendo?", tipo_pergunta: "TEXTO", obrigatoria: true },
        { id: 17, texto_pergunta: "Data da Abertura", tipo_pergunta: "DATA", obrigatoria: true },
        { id: 18, texto_pergunta: "Abriu cadeado das correntes (FRENTE DA EMPRESA)?", tipo_pergunta: "SIM_NAO", obrigatoria: true },
        { id: 19, texto_pergunta: "Desbloqueou o alarme?", tipo_pergunta: "SIM_NAO", obrigatoria: true },
        { id: 20, texto_pergunta: "Ligou TV (CÂMERAS)?", tipo_pergunta: "SIM_NAO", obrigatoria: true },
        { id: 21, texto_pergunta: "Coletou chaves internas no chaveiro?", tipo_pergunta: "SIM_NAO", obrigatoria: true },
        { id: 22, texto_pergunta: "Removeu cadeado portão?", tipo_pergunta: "SIM_NAO", obrigatoria: true },
        { id: 23, texto_pergunta: "Posicionou cone no estacionamento PCD?", tipo_pergunta: "SIM_NAO", obrigatoria: true },
        { id: 24, texto_pergunta: "Fez café do dia?", tipo_pergunta: "SIM_NAO", obrigatoria: true },
        { id: 25, texto_pergunta: "Houve alguma situação atípica?", tipo_pergunta: "TEXTO_LONGO", obrigatoria: false },
        { id: 15, texto_pergunta: "Anexar Fotos", tipo_pergunta: "ARQUIVO", obrigatoria: false }
    ]
  },
  {
    id: 3,
    name: "Formulário de Manutenção Predial",
    description: "Verificação periódica das condições do local de trabalho.",
    questions: [
         { id: 27, texto_pergunta: "Data da verificação", tipo_pergunta: "DATA", obrigatoria: false },
         { id: 28, texto_pergunta: "Condições do piso do escritório (ADM/ Diretoria/ Sala de reunião?", tipo_pergunta: "TEXTO", obrigatoria: false },
         { id: 29, texto_pergunta: "Condições do piso da Sala OPERACIONAL?", tipo_pergunta: "TEXTO", obrigatoria: false },
         { id: 30, texto_pergunta: "Condições do piso REFEITÓRIO?", tipo_pergunta: "TEXTO", obrigatoria: false },
         { id: 31, texto_pergunta: "Verificação das lâmpadas - Sala Administrativo?", tipo_pergunta: "SIM_NAO", obrigatoria: false },         
         { id: 32, texto_pergunta: "Verificação das lâmpadas - Sala Reunião?", tipo_pergunta: "SIM_NAO", obrigatoria: false },
         { id: 33, texto_pergunta: "Algum detalhe adicional? descreva abaixo", tipo_pergunta: "TEXTO_LONGO", obrigatoria: false },
         { id: 15, texto_pergunta: "Anexar Fotos", tipo_pergunta: "ARQUIVO", obrigatoria: false }
    ]
  }
];
