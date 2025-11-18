'use client';
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import styles from './fretes.module.css';
import { mockOrdensDeServico } from '@/services/mockCotacoes';
import { OSDetalhesModal } from './modalFrete'; 



// 2. ESTRUTURA INICIAL DAS COLUNAS

const colunasIniciais = {
  'Pendente': {
    id: 'Pendente',
    titulo: 'Pendentes',
    items: [],
  },
  'Em Andamento': {
    id: 'Em Andamento',
    titulo: 'Em Andamento',
    items: [],
  },
  'Concluído': {
    id: 'Concluído',
    titulo: 'Concluídos',
    items: [],
  },
};

// Componente da Página Kanban
export default function PaginaKanban() {

  const [columns, setColumns] = useState(colunasIniciais);

  useEffect(() => {
    // 3. LÓGICA PARA POPULAR O KANBAN
    
    const novasColunas = { ...colunasIniciais };
    novasColunas['Pendente'].items = [];
    novasColunas['Em Andamento'].items = [];
    novasColunas['Concluído'].items = [];

    mockOrdensDeServico.forEach((os) => {
      if (novasColunas[os.status]) {
        novasColunas[os.status].items.push(os);
      }
    });
    setColumns(novasColunas);
  }, []); // O array vazio garante que isso rode só uma vez

  
  // 4. Logica de handle drag
  const handleOnDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    // 1. Se o usuário soltou fora de uma coluna, não faz nada
    if (!destination) {
      return;
    }
    // logica para ultima coluna
    if (
      destination.droppableId === 'Concluído' &&
      source.droppableId !== 'Concluído'
    ) {
      // Pega o nome do card para o alerta
      const cardTitle = columns[source.droppableId].items[source.index].codigo;

      // Mostra o 'alert' de confirmação
      const isConfirmed = window.confirm(
        `Tem certeza que deseja marcar a "${cardTitle}" como Concluída?`
      );
      
      // Se o usuário clicar em "Cancelar", a função para aqui
      if (!isConfirmed) {
        return; 
      }
    }
    
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // 3. Lógica para reordenar no frontend
    const colunadeOrigem = columns[source.droppableId];
    const colunaDeDestino = columns[destination.droppableId];

    const novosItemsDeOrigem = Array.from(colunadeOrigem.items);
    const [itemMovido] = novosItemsDeOrigem.splice(source.index, 1);
    
    // Atualiza o estado visual IMEDIATAMENTE (para o usuário ver a mudança)
    if (source.droppableId === destination.droppableId) {
      // Movendo dentro da mesma coluna
      novosItemsDeOrigem.splice(destination.index, 0, itemMovido);
      
      const novaColuna = {
        ...colunadeOrigem,
        items: novosItemsDeOrigem,
      };
      setColumns({
        ...columns,
        [colunadeOrigem.id]: novaColuna,
      });

    } else {
      // Movendo para uma coluna DIFERENTE
      const novosItemsDeDestino = Array.from(colunaDeDestino.items);
      novosItemsDeDestino.splice(destination.index, 0, itemMovido);

      setColumns({
        ...columns,
        [colunadeOrigem.id]: {
          ...colunadeOrigem,
          items: novosItemsDeOrigem,
        },
        [colunaDeDestino.id]: {
          ...colunaDeDestino,
          items: novosItemsDeDestino,
        },
      });
    }

    // 4. CHAMADA PARA A API 
    // O 'draggableId' é o 'os.id'
    // O 'destination.droppableId' é o novo status (ex: "Em Andamento")
    console.log(`CHAMAR API: Mover OS ${draggableId} para o status ${destination.droppableId}`);
    
    /*
    try {
      // Exemplo de como seria a chamada de API
      const token = localStorage.getItem('authToken');
      await fetch(`http://localhost:3001/api/ordens-servico/${draggableId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status_operacional: destination.droppableId
        })
      });
    } catch (error) {
      console.error("Falha ao atualizar status:", error);
      // Lógica para reverter a mudança no frontend se a API falhar (opcional)
    }
    */
  };

  const [osSelecionada, setOsSelecionada] = useState(null);

  // 2. Função para abrir o modal
  const handleCardClick = (os) => {
    setOsSelecionada(os);
  };

  // 3. Função para salvar alterações (vinda do modal)
  const handleSalvarOS = async (osAtualizada) => {
    console.log("Salvando alterações:", osAtualizada);
    // AQUI VOCÊ CHAMA A API (PATCH)
    // E depois atualiza o estado 'columns' localmente para refletir a mudança
    setOsSelecionada(null); // Fecha o modal após salvar
  };

  return (
    <div className={styles.kanbanContainer}>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        {/* Mapeia sobre o objeto 'columns' para criar cada coluna */}
        {Object.values(columns).map((coluna) => (
          
          <Droppable key={coluna.id} droppableId={coluna.id}>
            {(provided, snapshot) => (
              <div
                className={`
                    ${styles.coluna} 
                    ${(coluna.id ==='Pendente') ? styles.colunaPendente : '' }
                    ${(coluna.id ==='Em Andamento') ? styles.colunaAndamento : '' }
                    ${(coluna.id ==='Concluido') ? styles.colunaConcluida : '' }
                    ${(snapshot.isDraggingOver && coluna.id === 'Concluído') ? styles.colunaBloqueada : ''}
                `}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <h2 className={styles.colunaTitulo}>{coluna.titulo}</h2>
                
                {/* Mapeia sobre os 'items' (cards) da coluna */}
                {coluna.items.map((item, index) => {

                  const isLocked = coluna.id === 'Concluído';

                  return(
                  <Draggable
                    key={item.id}
                    draggableId={item.id}
                    index={index}
                    isDragDisabled={isLocked}
                    
                  >
                    {(provided, snapshot) => (
                      <div
                        className={styles.card}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => handleCardClick(item)}
                        
                        style={{
                        ...provided.draggableProps.style,
                        opacity: isLocked ? 0.6 : 1, 
                        cursor: isLocked ? 'default' : 'grab',
                        backgroundColor: isLocked ? '#f0f0f0' : '#ffffff'
                      }}                
                      > 
                        <h1 className={styles.title}>{item.codigo} {isLocked && <span>🔒 </span>}</h1>
                        {item.status == 'Concluido' && (<p> ok</p>)}
                        <p><strong>Cliente:</strong> {item.cliente_nome}</p>
                        <p><strong>Origem: </strong>{item.origem_cidade}</p>
                         <p><strong>Destino:</strong> {item.destino_cidade} </p>
                        <p> </p>
                        <p><strong>Previsão entrega:</strong> {new Date(item.data_entrega_prevista).toLocaleDateString('pt-BR')}</p>
                      </div>
                    )}
                  </Draggable>
                  )
                })}
                
                {provided.placeholder}
              </div>
            )}
          </Droppable>

        ))}
      </DragDropContext>
      {osSelecionada && (
        <OSDetalhesModal 
          os={osSelecionada} 
          onClose={() => setOsSelecionada(null)}
          onSave={handleSalvarOS}
        />
      )}
    </div>
  );
}