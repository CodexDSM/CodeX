'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getApiUrl } from '@/lib/apiConfig';
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
    const [exportLoading, setExportLoading] = useState(false);
    const [exportError, setExportError] = useState(null);

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
                    apiUrl = getApiUrl('agregados');
                } else {
                    apiUrl = getApiUrl(`checklists/respostas?templateId=${selectedType}`);
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
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Link href="/operacional/checklist" passHref>
                        <Button variant="contained" color="primary">
                            Preencher Formulário
                        </Button>
                    </Link>
                    <Button
                        variant="outlined"
                        onClick={() => handleExportCsv()}
                        disabled={loading || exportLoading || submissions.length === 0}
                    >
                        {exportLoading ? 'Exportando...' : 'Exportar Excel'}
                    </Button>
                </Box>
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
                {exportError && (
                    <Typography color="error" sx={{ p: 2 }}>
                        Erro exportação: {exportError}
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

    async function handleExportCsv() {
        setExportError(null);
        setExportLoading(true);
        try {
            if (!selectedType) throw new Error('Selecione um formulário.');

            let apiUrl = '';
            if (selectedType === 'agregado_form') {
                apiUrl = getApiUrl('agregados');
            } else {
                apiUrl = getApiUrl(`checklists/respostas?templateId=${selectedType}`);
            }

            const authToken = localStorage.getItem('authToken');
            const response = await fetch(apiUrl, {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });

            if (!response.ok) {
                const txt = await response.text();
                throw new Error(txt || 'Falha ao buscar dados para exportação.');
            }

            const responseData = await response.json();
            let dataArray = [];
            if (selectedType === 'agregado_form') {
                dataArray = responseData.data || [];
            } else {
                dataArray = Array.isArray(responseData) ? responseData : [];
            }

            if (!dataArray.length) {
                throw new Error('Nenhum registro disponível para exportação.');
            }

            // Use current visible columns if available, otherwise derive from first row
            const cols = (columns && columns.length) ? columns : Object.keys(dataArray[0] || {});

            const sep = ';';
            const escapeCell = (s) => {
                if (s == null) return '';
                const str = String(s).replace(/"/g, '""');
                if (str.includes(sep) || str.includes('\n') || str.includes('"')) return `"${str}"`;
                return str;
            };

            const formatNumberForExcel = (v) => {
                if (v == null || v === '') return '';
                const n = Number(v);
                if (Number.isNaN(n)) return String(v);
                return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            };

            const formatValue = (val) => {
                if (val == null) return '';
                // Dates
                if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
                    const d = new Date(val);
                    return d.toLocaleString('pt-BR');
                }
                if (typeof val === 'number') return formatNumberForExcel(val);
                if (typeof val === 'string' && /^-?\d+(?:\.\d+)?$/.test(val)) return formatNumberForExcel(Number(val));
                if (val === 0) return 'Não';
                if (val === 1) return 'Sim';
                return String(val);
            };

            const lines = [];
            // Header row
            lines.push(cols.map(c => escapeCell(formatHeader(c))).join(sep));

            for (const row of dataArray) {
                const cells = cols.map(col => escapeCell(formatValue(row[col])));
                lines.push(cells.join(sep));
            }

            const csvText = lines.join('\r\n');
            const bom = '\uFEFF';
            const blob = new Blob([bom + csvText], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            const now = new Date();
            const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
            link.href = url;
            link.download = `respostas_checklist_${timestamp}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error('Erro export CSV', err);
            setExportError(err.message || 'Erro ao exportar CSV');
        } finally {
            setExportLoading(false);
        }
    }
}
