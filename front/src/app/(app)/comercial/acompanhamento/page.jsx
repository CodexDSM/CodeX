'use client'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useEffect, useState } from 'react'
import styles from './acompanhamento.module.css'
import { Plus, X, Trash } from 'lucide-react'
import { getApiUrl } from '@/lib/apiConfig'

export default function AcompanhamentoPage() {
    const [columns, setColumns] = useState({})
    const [ordemColunas, setOrdemColunas] = useState([])
    const [clientes, setClientes] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [form, setForm] = useState({
        cliente_id: '',
        titulo: '',
        descricao: '',
        prioridade: 'Normal'
    })

    useEffect(() => {
        fetchData()
        fetchClientes()
    }, [])

    async function fetchData() {
        try {
            setLoading(true)
            const token = localStorage.getItem('authToken')
            const resp = await fetch('http://localhost:3001/api/acompanhamento', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await resp.json()
            setColumns(data.columns)
            setOrdemColunas(data.ordemColunas)
        } catch (err) {
            setError('Erro ao carregar acompanhamentos')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function fetchClientes() {
        try {
            const token = localStorage.getItem('authToken')
            const resp = await fetch('http://localhost:3001/api/acompanhamento/clientes/lista', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await resp.json()
            setClientes(data)
        } catch (err) {
            console.error('Erro ao buscar clientes', err)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        setSuccess(null)

        try {
            const token = localStorage.getItem('authToken')
            const resp = await fetch('http://localhost:3001/api/acompanhamento/criar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            })

            if (!resp.ok) {
                const data = await resp.json()
                throw new Error(data.message || 'Erro ao criar acompanhamento')
            }

            setSuccess('Acompanhamento criado com sucesso!')
            setForm({ cliente_id: '', titulo: '', descricao: '', prioridade: 'Normal' })
            setShowModal(false)
            
            // Recarrega os dados
            setTimeout(() => {
                fetchData()
            }, 500)
        } catch (err) {
            setError(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

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

            // Atualiza status no backend
            const token = localStorage.getItem('authToken')
            fetch('http://localhost:3001/api/acompanhamento/mover', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cardId: draggableId, etapaId: destination.droppableId })
            }).catch(err => console.error('Erro ao atualizar status:', err))
        }
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Carregando acompanhamentos...</div>
            </div>
        )
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
                                                                    👤 {item.cliente_nome ?? 'Sem cliente'}
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
                                    <option value="">Selecione um cliente...</option>
                                    {clientes.map(cliente => (
                                        <option key={cliente.id} value={cliente.id}>
                                            {cliente.nome} - {cliente.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Título *</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={form.titulo}
                                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                                    placeholder="Ex: Contato Inicial - Empresa XYZ"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Descrição</label>
                                <textarea
                                    className={styles.textarea}
                                    value={form.descricao}
                                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                                    placeholder="Descreva o acompanhamento..."
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Prioridade</label>
                                <select
                                    className={styles.select}
                                    value={form.prioridade}
                                    onChange={(e) => setForm({ ...form, prioridade: e.target.value })}
                                >
                                    <option value="Baixa">Baixa</option>
                                    <option value="Normal">Normal</option>
                                    <option value="Alta">Alta</option>
                                </select>
                            </div>

                            <div className={styles.modalFooter}>
                                <button
                                    type="button"
                                    className={styles.btnCancel}
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className={styles.btnSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Criando...' : 'Criar Acompanhamento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
