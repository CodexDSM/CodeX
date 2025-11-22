'use client'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useEffect, useState } from 'react'

export default function AcompanhamentoPage() {
    const [columns, setColumns] = useState({})
    const [ordemColunas, setOrdemColunas] = useState([])

    useEffect(() => {
        async function fetchData() {
            const resp = await fetch('http://localhost:3001/api/acompanhamento')
            const data = await resp.json()
            setColumns(data.columns)
            setOrdemColunas(data.ordemColunas)
        }
        fetchData()
    }, [])

    async function onDragEnd(result) {
        const { source, destination, draggableId } = result
        if (!destination) return

        const sourceCol = columns[source.droppableId]
        const destCol = columns[destination.droppableId]
        const sourceItens = Array.from(sourceCol.itens)
        const [removed] = sourceItens.splice(source.index, 1)

        if (source.droppableId === destination.droppableId) {
            sourceItens.splice(destination.index, 0, removed)
            setColumns({
                ...columns,
                [source.droppableId]: { ...sourceCol, itens: sourceItens }
            })
        } else {
            const destItens = Array.from(destCol.itens)
            destItens.splice(destination.index, 0, removed)
            setColumns({
                ...columns,
                [source.droppableId]: { ...sourceCol, itens: sourceItens },
                [destination.droppableId]: { ...destCol, itens: destItens }
            })
            await fetch('http://localhost:3001/api/acompanhamento/mover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cardId: draggableId, etapaId: destination.droppableId })
            })
        }
    }

    return (
        <div
            style={{
                margin: 0,
                padding: 0,
                minHeight: '100vh',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'stretch',
                width: '100vw',
                gap: '20px',
                background: '#fafbfc',
                overflowY: 'hidden',
                overflowX: 'visible'

            }}
        >
            <DragDropContext onDragEnd={onDragEnd}>
                {Array.isArray(ordemColunas) && ordemColunas.map(colId => {
                    const coluna = columns[colId]
                    return (
                        <Droppable droppableId={colId} key={colId}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    style={{
                                        background: '#fff',
                                        borderRadius: 12,
                                        padding: '18px 12px',
                                        boxShadow: '0 2px 12px 0 rgba(60,80,100,.08)',
                                        border: '1px solid #ededed',
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        minWidth: 0 // permite ajustar ao container, não força largura mínima
                                    }}
                                >
                                    <h2 style={{
                                        marginBottom: 10,
                                        color: '#286',
                                        fontSize: '1.1rem',
                                        fontWeight: 700,
                                        textAlign: 'left',
                                        letterSpacing: '1px'
                                    }}>
                                        {coluna?.nome}
                                    </h2>
                                    {coluna?.itens.map((item, idx) => (
                                        <Draggable draggableId={item.id.toString()} index={idx} key={item.id}>
                                            {(prov) => (
                                                <div
                                                    ref={prov.innerRef}
                                                    {...prov.draggableProps}
                                                    {...prov.dragHandleProps}
                                                    style={{
                                                        background: '#f7fafc',
                                                        borderRadius: 8,
                                                        padding: 14,
                                                        marginBottom: 12,
                                                        boxShadow: '0 1px 6px rgba(100,120,150,0.07)',
                                                        borderLeft: '4px solid #48a4e0',
                                                        ...prov.draggableProps.style,
                                                        minWidth: 0
                                                    }}
                                                >
                                                    <div style={{
                                                        fontWeight: 600,
                                                        color: '#224497',
                                                        fontSize: '1rem',
                                                        marginBottom: 2
                                                    }}>
                                                        {item.titulo}
                                                    </div>
                                                    <div style={{
                                                        color: '#2d3340',
                                                        fontSize: 13,
                                                        marginBottom: 8
                                                    }}>
                                                        Cliente:{' '}<span style={{ fontWeight: 500, color: '#3374b1' }}>{item.cliente_nome ?? '[não informado]'}</span>
                                                    </div>
                                                    <div style={{
                                                        color: '#555',
                                                        fontSize: 12,
                                                        marginBottom: 6
                                                    }}>
                                                        {item.descricao}
                                                    </div>
                                                    <div style={{
                                                        fontSize: 11,
                                                        color: '#30a48c',
                                                        fontWeight: 500
                                                    }}>
                                                        Prioridade: {item.prioridade ?? '--'}
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    )
                })}
            </DragDropContext>
        </div>
    )
}
