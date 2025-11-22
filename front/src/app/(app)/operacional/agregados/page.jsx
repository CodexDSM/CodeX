'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Container, Typography, Paper, Button, Box,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';

const formatHeader = (header) => {
    return header
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};


const HIDDEN_COLUMNS = [
    'id',
    'criado_em',
    'atualizado_em',
    'registro_id',
    'pergunta_id',
    'template_id',
    'colaborador_id',
    'ativo_relacionado_id'
];

export default function ListarSubmissionsPage() {
    const [submissions, setSubmissions] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedType, setSelectedType] = useState('agregado_form');
    const [templates, setTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);

    // Buscar templates disponíveis (pode ser expandido para buscar do banco futuramente)
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setTemplates([
                    { id: 1, name: 'Checklist de Veículos' },
                    { id: 2, name: 'Checklist de Manutenção' },
                    { id: 3, name: 'Checklist de Segurança' },
                ]);
            } catch (err) {
                console.error('Erro ao carregar templates:', err);
                setTemplates([]);
            } finally {
                setLoadingTemplates(false);
            }
        };

        fetchTemplates();
    }, []);
    useEffect(() => {
        const fetchSubmissions = async () => {
            if (!selectedType) return;

            setLoading(true);
            setError(null);
            setSubmissions([]);
            setColumns([]);

            try {
                let apiUrl = '';
                if (selectedType === 'agregado_form') {
                    apiUrl = 'http://localhost:3001/api/agregados';
                } else {
                    apiUrl = `http://localhost:3001/api/checklists/respostas?templateId=${selectedType}`;
                }

                const authToken = localStorage.getItem('authToken');
                const response = await fetch(apiUrl, {
                    headers: { 'Authorization': `Bearer ${authToken}` },
                });

                if (!response.ok) {
                    throw new Error('Falha ao buscar dados da API.');
                }

                const responseData = await response.json();

                console.log('Resposta da API:', responseData);

                let dataArray = [];
                if (selectedType === 'agregado_form') {
                    dataArray = responseData.data || [];
                } else {
                    dataArray = Array.isArray(responseData) ? responseData : [];
                }

                console.log('Dados processados:', dataArray);

                if (dataArray.length > 0) {
                    const allColumns = Object.keys(dataArray[0]);
                    const visibleColumns = allColumns.filter(col => !HIDDEN_COLUMNS.includes(col));

                    setColumns(visibleColumns);
                    setSubmissions(dataArray);
                }

            } catch (err) {
                console.error('Erro ao buscar submissões:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [selectedType]);

    const formatCellValue = (value) => {
        if (value === null || value === undefined) return '-';

        if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
            const date = new Date(value);
            return date.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        if (value === 0) return 'Não';
        if (value === 1) return 'Sim';

        return value;
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Histórico de Formulários
                </Typography>
                <Link href="/operacional/checklist" passHref>
                    <Button variant="contained" color="primary">
                        Preencher Formulário
                    </Button>
                </Link>
            </Box>

            <Paper sx={{ p: 3 }}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel >Selecione o Formulário para Visualizar</InputLabel>
                    <Select sx={{ mt: 2, mb: 2 }}
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        disabled={loadingTemplates}
                    >
                        <MenuItem value="agregado_form">Formulário de Agregados</MenuItem>
                        {templates.map((template) => (
                            <MenuItem key={template.id} value={template.id}>
                                {template.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {loading && (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Typography color="error" sx={{ p: 2 }}>
                        Erro: {error}
                    </Typography>
                )}

                {!loading && !error && (
                    submissions.length === 0 ? (
                        <Typography sx={{ p: 2 }}>
                            Nenhum registro encontrado para este formulário.
                        </Typography>
                    ) : (
                        <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        {columns.map((col) => (
                                            <TableCell
                                                key={col}
                                                sx={{
                                                    fontWeight: 'bold',
                                                    backgroundColor: '#f5f5f5',
                                                    whiteSpace: 'nowrap',
                                                    minWidth: '150px'
                                                }}
                                            >
                                                {formatHeader(col)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {submissions.map((row, index) => (
                                        <TableRow
                                            key={index}
                                            sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
                                        >
                                            {columns.map((col) => (
                                                <TableCell
                                                    key={col}
                                                    sx={{
                                                        whiteSpace: 'nowrap',
                                                        maxWidth: '300px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                >
                                                    {formatCellValue(row[col])}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )
                )}
            </Paper>
        </Container>
    );
}
