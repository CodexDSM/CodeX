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
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Acompanhamento de Clientes</h1>
                <button className={styles.btnCriar} onClick={() => setShowModal(true)}>
                    <Plus size={20} /> Novo Acompanhamento
                </button>
            </div>

            {error && <div style={{ padding: '0 30px' }}><div className={styles.error}>{error}</div></div>}
            {success && <div style={{ padding: '0 30px' }}><div className={styles.success}>{success}</div></div>}

            <div className={styles.boardContainer}>
                <DragDropContext onDragEnd={onDragEnd}>
                    {Array.isArray(ordemColunas) && ordemColunas.map(colId => {
                        const coluna = columns[colId]
                        return (
                            <Droppable droppableId={colId} key={colId}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={styles.column}
                                    >
                                        <div className={styles.columnHeader}>
                                            {coluna?.nome}
                                        </div>
                                        <div className={styles.columnContent}>
                                            {coluna?.itens && coluna.itens.length > 0 ? (
                                                coluna.itens.map((item, idx) => (
                                                    <Draggable draggableId={item.id.toString()} index={idx} key={item.id}>
                                                        {(prov, snapshot) => (
                                                            <div
                                                                ref={prov.innerRef}
                                                                {...prov.draggableProps}
                                                                {...prov.dragHandleProps}
                                                                className={styles.card}
                                                                style={{
                                                                    ...prov.draggableProps.style,
                                                                    opacity: snapshot.isDragging ? 0.8 : 1,
                                                                }}
                                                            >
                                                                <div className={styles.cardHeader}>
                                                                    <h3 className={styles.cardTitle}>{item.titulo}</h3>
                                                                    <span className={`${styles.cardPriority} ${styles['priority' + item.prioridade.charAt(0).toUpperCase() + item.prioridade.slice(1)]}`}>
                                                                        {item.prioridade}
                                                                    </span>
                                                                </div>
                                                                <div className={styles.cardClient}>
                                                                     {item.cliente_nome ?? 'Sem cliente'}
                                                                </div>
                                                                {item.descricao && (
                                                                    <div className={styles.cardDesc}>{item.descricao}</div>
                                                                )}
                                                                <div className={styles.cardFooter}>
                                                                            <span>ID: #{item.id}</span>
                                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                                <button
                                                                                    title="Remover acompanhamento"
                                                                                    onClick={async () => {
                                                                                        if (!confirm('Remover este acompanhamento?')) return;
                                                                                        try {
                                                                                            const token = localStorage.getItem('authToken')
                                                                                            const resp = await fetch(`http://localhost:3001/api/acompanhamento/${item.id}`, {
                                                                                                method: 'DELETE',
                                                                                                headers: { 'Authorization': `Bearer ${token}` }
                                                                                            })
                                                                                            if (!resp.ok) throw new Error('Erro ao remover')
                                                                                            // remover do estado
                                                                                            const newColumns = { ...columns }
                                                                                            Object.keys(newColumns).forEach(colId => {
                                                                                                newColumns[colId].itens = newColumns[colId].itens.filter(i => i.id !== item.id)
                                                                                            })
                                                                                            setColumns(newColumns)
                                                                                        } catch (err) {
                                                                                            console.error(err)
                                                                                            alert('Erro ao remover acompanhamento')
                                                                                        }
                                                                                    }}
                                                                                    style={{
                                                                                        background: 'transparent',
                                                                                        border: 'none',
                                                                                        cursor: 'pointer',
                                                                                        color: '#c0392b'
                                                                                    }}
                                                                                >
                                                                                    <Trash size={16} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))
                                            ) : (
                                                <div className={styles.placeholder}>Nenhum acompanhamento</div>
                                            )}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        )
                    })}
                </DragDropContext>
            </div>

            {/* Modal Criar Acompanhamento */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            Novo Acompanhamento
                        </div>

                        {error && <div className={styles.error}>{error}</div>}
                        {success && <div className={styles.success}>{success}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Cliente *</label>
                                <select
                                    className={styles.select}
                                    value={form.cliente_id}
                                    onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
                                    required
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
