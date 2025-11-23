'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import styles from './fretes.module.css';
import { OSDetalhesModal } from './modalFrete';
import { getApiUrl, getAuthHeaders } from '@/lib/apiConfig';

const colunasIniciais = {
  Pendente: {
    id: 'Pendente',
    titulo: 'Pendentes',
    items: []
  },
  'Em Andamento': {
    id: 'Em Andamento',
    titulo: 'Em Andamento',
    items: []
  },
  Concluído: {
    id: 'Concluído',
    titulo: 'Concluídos',
    items: []
  }
};

export default function PaginaKanban() {
  const [columns, setColumns] = useState(colunasIniciais);
  const [osSelecionada, setOsSelecionada] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const carregarFretes = async () => {
      try {
        const res = await fetch(getApiUrl('/fretes'), {
          headers: getAuthHeaders()
        });
        if (!res.ok) {
          console.error('Erro ao buscar fretes', await res.text());
          return;
        }
        const dados = await res.json();

        const novasColunas = {
          Pendente: { ...colunasIniciais.Pendente, items: [] },
          'Em Andamento': { ...colunasIniciais['Em Andamento'], items: [] },
          Concluído: { ...colunasIniciais.Concluído, items: [] }
        };

        dados.forEach(os => {
          const rawStatus = os.status || '';
          const statusBack = rawStatus.toLowerCase().trim();

          const statusFront =
            statusBack === 'entregue'
              ? 'Concluído'
              : statusBack === 'pendente' || statusBack === '' || statusBack === 'aguardando'
              ? 'Pendente'
              : 'Em Andamento';

          if (novasColunas[statusFront]) {
            novasColunas[statusFront].items.push({
              id: String(os.id),
              codigo: os.codigo,
              cliente: os.cliente,
              documento: os.documento,
              responsavel: os.responsavel,
              motorista_id: os.motorista_id,
              motorista: os.motorista,
              veiculo: os.veiculo,
              status: statusFront,
              origem: os.origem,
              destino: os.destino,
              valor: os.valor,
              data_coleta: os.data_coleta,
              data_entrega_prevista: os.data_entrega_prevista,
              data_entrega: os.data_entrega,
              observacoes: os.observacoes || ''
            });
          }
        });

        setColumns(novasColunas);
      } catch (error) {
        console.error('Falha ao carregar fretes', error);
      }
    };

    carregarFretes();
  }, []);

  const concluirFreteBackend = async freteId => {
    const res = await fetch(getApiUrl(`/fretes/${freteId}/concluir`), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({})
    });

    if (!res.ok) {
      console.error('Erro ao concluir frete', await res.text());
      throw new Error('Erro ao concluir frete');
    }

    return res.json();
  };

  const handleOnDragEnd = async result => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    const arrastandoParaConcluido =
      destination.droppableId === 'Concluído' &&
      source.droppableId !== 'Concluído';

    if (arrastandoParaConcluido) {
      const cardTitle = columns[source.droppableId].items[source.index].codigo;
      const isConfirmed = window.confirm(
        `Tem certeza que deseja marcar a "${cardTitle}" como Concluída e gerar faturamento?`
      );
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

    const colunadeOrigem = columns[source.droppableId];
    const colunaDeDestino = columns[destination.droppableId];

    const novosItemsDeOrigem = Array.from(colunadeOrigem.items);
    const [itemMovido] = novosItemsDeOrigem.splice(source.index, 1);

    let novosItemsDeDestino = Array.from(colunaDeDestino.items);

    if (source.droppableId === destination.droppableId) {
      novosItemsDeOrigem.splice(destination.index, 0, itemMovido);

      const novaColuna = {
        ...colunadeOrigem,
        items: novosItemsDeOrigem
      };
      setColumns({
        ...columns,
        [colunadeOrigem.id]: novaColuna
      });
    } else {
      novosItemsDeDestino.splice(destination.index, 0, {
        ...itemMovido,
        status: destination.droppableId
      });

      setColumns({
        ...columns,
        [colunadeOrigem.id]: {
          ...colunadeOrigem,
          items: novosItemsDeOrigem
        },
        [colunaDeDestino.id]: {
          ...colunaDeDestino,
          items: novosItemsDeDestino
        }
      });
    }

    const novoStatusBackend =
      destination.droppableId === 'Concluído'
        ? 'Entregue'
        : destination.droppableId === 'Pendente'
        ? 'Pendente'
        : 'Transito';

    try {
      await fetch(getApiUrl(`/fretes/${draggableId}/status`), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: novoStatusBackend })
      });

      if (arrastandoParaConcluido) {
        try {
          await concluirFreteBackend(draggableId);
          const irParaFaturamentos = window.confirm(
            'Frete concluído e faturamento gerado. Deseja ir para a tela de faturamentos?'
          );
          if (irParaFaturamentos) {
            window.location.href = '/faturamentos';
          }
        } catch (e) {
          console.error(e);
        }
      }
    } catch (error) {
      console.error('Falha ao atualizar status:', error);
    }
  };

  const handleCardClick = os => {
    setOsSelecionada(os);
  };

  const handleSalvarOS = async osAtualizada => {
    try {
      await fetch(getApiUrl(`/fretes/${osAtualizada.id}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          motorista_id: osAtualizada.motorista_id,
          veiculo_id: osAtualizada.veiculo_id,
          status:
            osAtualizada.status === 'Concluído'
              ? 'Entregue'
              : osAtualizada.status,
          distancia_km: osAtualizada.distancia_km,
          valor: osAtualizada.valor,
          peso_kg: osAtualizada.peso_kg,
          data_entrega_prevista: osAtualizada.data_entrega_prevista,
          data_entrega: osAtualizada.data_entrega,
          observacoes: osAtualizada.observacoes
        })
      });

      setColumns(prev => {
        const novas = { ...prev };
        Object.keys(novas).forEach(colId => {
          novas[colId] = {
            ...novas[colId],
            items: novas[colId].items.map(item =>
              item.id === osAtualizada.id ? { ...item, ...osAtualizada } : item
            )
          };
        });
        return novas;
      });
    } catch (error) {
      console.error('Falha ao salvar alterações:', error);
    } finally {
      setOsSelecionada(null);
    }
  };

  return (
    <div className={styles.kanbanContainer}>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        {Object.values(columns).map(coluna => (
          <Droppable key={coluna.id} droppableId={coluna.id}>
            {(provided, snapshot) => (
              <div
                className={`${styles.coluna} ${
                  coluna.id === 'Pendente' ? styles.colunaPendente : ''
                } ${
                  coluna.id === 'Em Andamento' ? styles.colunaAndamento : ''
                } ${
                  coluna.id === 'Concluído' ? styles.colunaConcluida : ''
                } ${
                  snapshot.isDraggingOver && coluna.id === 'Concluído'
                    ? styles.colunaBloqueada
                    : ''
                }`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <h2 className={styles.colunaTitulo}>{coluna.titulo}</h2>
                {coluna.items.map((item, index) => {
                  const isLocked = coluna.id === 'Concluído';

                  return (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                      isDragDisabled={isLocked}
                    >
                      {(providedDrag, snapshotDrag) => (
                        <div
                          className={styles.card}
                          ref={providedDrag.innerRef}
                          {...providedDrag.draggableProps}
                          {...providedDrag.dragHandleProps}
                          onClick={() => handleCardClick(item)}
                          style={{
                            ...providedDrag.draggableProps.style,
                            opacity: isLocked ? 0.6 : 1,
                            cursor: isLocked ? 'default' : 'grab',
                            backgroundColor: isLocked ? '#f0f0f0' : '#ffffff'
                          }}
                        >
                          <h1 className={styles.title}>
                            {item.codigo} {isLocked && <span>🔒 </span>}
                          </h1>
                          <p>
                            <strong>Cliente:</strong> {item.cliente}
                          </p>
                          <p>
                            <strong>Origem: </strong>
                            {item.origem}
                          </p>
                          <p>
                            <strong>Destino:</strong> {item.destino}
                          </p>
                          <p>
                            <strong>Previsão entrega:</strong>{' '}
                            {item.data_entrega_prevista
                              ? new Date(
                                  item.data_entrega_prevista
                                ).toLocaleDateString('pt-BR')
                              : '-'}
                          </p>
                        </div>
                      )}
                    </Draggable>
                  );
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
