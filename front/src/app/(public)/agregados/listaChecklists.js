export const mockTemplates = [
  { 
    id: 1, 
    name: "Motorista - Checklist Diário", 
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
    name: "Cliente - Pesquisa de Satisfação",
    description: "Para ser preenchido pelos clientes após a entrega do serviço.",
    questions: [
        { id: 1, texto_pergunta: "Nome do Cliente", tipo_pergunta: "TEXTO", obrigatoria: true },
        { id: 2, texto_pergunta: "Data do Serviço", tipo_pergunta: "DATA", obrigatoria: true },
        { id: 3, texto_pergunta: "Como você avalia a pontualidade da entrega?", tipo_pergunta: "NUMERO", obrigatoria: true },
        { id: 4, texto_pergunta: "Como você avalia a condição do veículo na entrega?", tipo_pergunta: "NUMERO", obrigatoria: true },
        { id: 5, texto_pergunta: "O motorista foi cortês e profissional?", tipo_pergunta: "SIM_NAO", obrigatoria: true },
        { id: 6, texto_pergunta: "Você recomendaria nossos serviços a outros?", tipo_pergunta: "SIM_NAO", obrigatoria: true },
        { id: 7, texto_pergunta: "Comentários adicionais ou sugestões", tipo_pergunta: "TEXTO_LONGO", obrigatoria: false },
        { id: 8, texto_pergunta: "Anexar Fotos (se aplicável)", tipo_pergunta: "ARQUIVO", obrigatoria: false },
    ]
  }
];
