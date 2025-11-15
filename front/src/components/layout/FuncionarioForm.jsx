"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/apiConfig';
import { Card,CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import styles from './funcionario.module.css';

export default function CadastroColaborador() {
  const router = useRouter();
  
  // Estado inicial do formulário
  const initialFormData = {
    nome: '',
    cpf: '',
    email: '',
    senha: '',
    telefone: '',
    perfil: 'Operador',
    ativo: true,
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: ''
  };
  
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const perfis = [
    'Administrador', 'Gerente', 'Operador', 'Comercial'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCpfChange = (e) => {
    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
    if (onlyNums.length <= 11) {
      setFormData(prev => ({ ...prev, cpf: onlyNums }));
    }
  };

  const handleCepChange = (e) => {
    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
    if (onlyNums.length <= 8) {
      setFormData(prev => ({ ...prev, cep: onlyNums }));
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');  
  
      const response = await fetch(getApiUrl('colaboradores'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });
      setIsLoading(false);
        if (response.ok) {
          router.push('/administrativo/colaboradores');
        }else {
        const err = await response.json();
        alert('Erro: ' + err.message);
      }
    } catch (error) {
      alert('Erro ao enviar dados: ' + error.message);
    }
  }

  return (
    <CardContent>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Cadastro de Colaborador</h2>
        
        {error && <p className={styles.errorMessage}>{error}</p>}
        
        <div className={styles.formGrid}>
          <div className={styles.inputWrapper}>
            <label className={styles.label}>Nome Completo *</label>
            <input
              name="nome"
              placeholder="Digite o nome completo"
              value={formData.nome}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>CPF *</label>
            <input
              name="cpf"
              placeholder="Digite apenas números"
              value={formData.cpf}
              onChange={handleCpfChange}
              required
              inputMode="numeric"
              maxLength={11}
              className={styles.input}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>E-mail *</label>
            <input
              name="email"
              type="email"
              placeholder="exemplo@empresa.com"
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>Senha *</label>
            <input
              name="senha"
              type="password"
              placeholder="**********"
              value={formData.senha}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>Telefone</label>
            <input
              name="telefone"
              placeholder="(00) 00000-0000"
              value={formData.telefone}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>Perfil *</label>
            <select
              name="perfil"
              value={formData.perfil}
              onChange={handleChange}
              required
              className={styles.select}
            >
              <option value="" disabled>Selecione o perfil</option>
              {perfis.map((perfil) => (
                <option key={perfil} value={perfil}>
                  {perfil}
                </option>
              ))}
            </select>
          </div>
        </div>

        

        <div className={styles.buttonContainer}>
          <Button type="submit" variant="adicionar" disabled={isLoading}>
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </CardContent>
  );
}
