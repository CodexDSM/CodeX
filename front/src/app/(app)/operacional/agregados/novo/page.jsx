import React from 'react';
import { Container, Typography, Paper } from '@mui/material';
import FormAgregado from '@/components/layout/FormAgregado'; // <-- LINHA CORRIGIDA

export default function NovoAgregadoPage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        sx={{ 
          p: 3, 
          display: 'flex', 
          flexDirection: 'column',
        }}
      >
        <Typography component="h1" variant="h5" gutterBottom>
          Cadastrar Novo Agregado (Parceiro)
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Preencha os campos abaixo para incluir um novo parceiro no sistema.
        </Typography>

        <FormAgregado />
      </Paper>
    </Container>
  );
}