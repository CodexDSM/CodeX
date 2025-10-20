'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Container, Typography, Paper, Button, Box,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { mockTemplates } from '@/app/(app)/operacional/listaChecklists';

// Função para deixar os nomes das colunas mais bonitos (ex: nome_motorista -> Nome Motorista)
const formatHeader = (header) => {
    return header.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

export default function ListarSubmissionsPage() {
    const [submissions, setSubmissions] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedType, setSelectedType] = useState('agregado_form');

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
                const data = await response.json();

                if (data.length > 0) {
                    setColumns(Object.keys(data[0]));
                    setSubmissions(data);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [selectedType]);

    // O resto do seu código JSX permanece o mesmo...
    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* ...cabeçalho da página... */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography component="h1" variant="h5">
                    Histórico de Formulários
                </Typography>
                <Link href="/operacional/checklist" passHref>
                    <Button variant="contained" color="primary">
                        Preencher Formulário
                    </Button>
                </Link>
            </Box>

            <Paper sx={{ p: 3 }}>
                {/* ...dropdown de filtro... */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="type-select-label">Selecione o Formulário para Visualizar</InputLabel>
                    <Select
                        labelId="type-select-label"
                        value={selectedType}
                        label="Selecione o Formulário para Visualizar"
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
                        {mockTemplates.map((template) => (
                            <MenuItem key={template.id} value={template.id}>{template.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* ...tabela dinâmica... */}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>
                )}
                {error && <Typography color="error" align="center">Erro: {error}</Typography>}

                {!loading && !error && (
                    submissions.length === 0 ? (
                        <Typography align="center">Nenhum registro encontrado para este formulário.</Typography>
                    ) : (
                        <TableContainer>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow>
                                        {columns.map((col) => (
                                            <TableCell key={col} sx={{ fontWeight: 'bold' }}>{formatHeader(col)}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {submissions.map((row, index) => (
                                        <TableRow key={row.id || index}>
                                            {columns.map((col) => (
                                                <TableCell key={col}>{row[col]}</TableCell>
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