// app/listaChecklists.js

// Estes são os dados mock que simulam a informação vinda da sua API/banco de dados.
// Eles definem os modelos de checklist disponíveis para o usuário.
export const mockTemplates = [
  { 
    id: 1, 
    name: "Checklist Diário - Frota Newe", 
    description: "Para ser preenchido diariamente pelos motoristas da frota própria.", 
    questions: [
        { id: 1, texto_pergunta: "Nome do Motorista", tipo_pergunta: "TEXTO", obrigatoria: true },
        { id: 2, texto_pergunta: "Placa do Veículo", tipo_pergunta: "TEXTO", obrigatoria: true },
        { id: 3, texto_pergunta: "Data do Check-List", tipo_pergunta: "DATA", obrigatoria: true },
        { id: 9, texto_pergunta: "Óleo do Motor ok?", tipo_pergunta: "SIM_NAO", obrigatoria: true },
        { id: 12, texto_pergunta: "Estado dos Pneus ok?", tipo_pergunta: "SIM_NAO", obrigatoria: true },
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
        { id: 19, texto_pergunta: "Desbloqueou o alarme?", tipo_pergunta: "SIM_NAO", obrigatoria: true },
        { id: 20, texto_pergunta: "Ligou TV (CÂMERAS)?", tipo_pergunta: "SIM_NAO", obrigatoria: true },
        { id: 25, texto_pergunta: "Houve alguma situação atípica?", tipo_pergunta: "TEXTO_LONGO", obrigatoria: false }
    ]
  },
  {
    id: 3,
    name: "Formulário de Manutenção ",
    description: "Verificação periódica das condições do local de trabalho.",
    questions: [
         { id: 26, texto_pergunta: "Data da verificação", tipo_pergunta: "DATA", obrigatoria: true },
         { id: 27, texto_pergunta: "Condições do piso do galpão?", tipo_pergunta: "TEXTO", obrigatoria: true },
         { id: 28, texto_pergunta: "Extintores estão com a recarga em dia?", tipo_pergunta: "SIM_NAO", obrigatoria: true },
    ]
  }
];
