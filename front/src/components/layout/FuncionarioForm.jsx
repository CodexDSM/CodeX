"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card,CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const estados = [
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const perfis = [
    'Administrador', 'Gerente', 'Operador', 'Motorista'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  // Função para limpar todos os campos
  const handleClear = () => {
    setFormData(initialFormData);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Aqui viria a chamada API para cadastrar o colaborador
      console.log('Dados do formulário:', formData);
      
      // Simulação de sucesso no cadastro
      setTimeout(() => {
        alert('Colaborador cadastrado com sucesso!');
        router.push('/colaboradores');
      }, 1000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    
        <CardContent >
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
                <Select 
                  onValueChange={(value) => handleSelectChange('perfil', value)} 
                  value={formData.perfil}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {perfis.map((perfil) => (
                      <SelectItem key={perfil} value={perfil}>
                        {perfil}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <h3 className={styles.subtitle}>Endereço</h3>
            
            <div className={styles.formGrid}>
              <div className={styles.inputWrapper}>
                <label className={styles.label}>CEP *</label>
                <input
                  name="cep"
                  placeholder="Digite apenas números"
                  value={formData.cep}
                  onChange={handleCepChange}
                  required
                  inputMode="numeric"
                  maxLength={8}
                  className={styles.input}
                />
              </div>

              <div className={`${styles.inputWrapper} ${styles.span2}`}>
                <label className={styles.label}>Logradouro *</label>
                <input
                  name="logradouro"
                  placeholder="Rua, Avenida, etc."
                  value={formData.logradouro}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.label}>Número *</label>
                <input
                  name="numero"
                  placeholder="Número"
                  value={formData.numero}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.label}>Complemento</label>
                <input
                  name="complemento"
                  placeholder="Apartamento, bloco, etc."
                  value={formData.complemento}
                  onChange={handleChange}
                  className={styles.input}
                />

              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.label}>Bairro *</label>
                <input
                  name="bairro"
                  placeholder="Bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.label}>Cidade *</label>
                <input
                  name="cidade"
                  placeholder="Cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.label}>UF *</label>
                <Select 
                  onValueChange={(value) => handleSelectChange('uf', value)} 
                  value={formData.uf}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className={styles.buttonContainer}>
              <Button 
                type="button" 
                variant="clear"
                onClick={handleClear}
              >
                Limpar
              </Button>
              <Button type="submit" variant="adicionar" disabled={isLoading}>
                {isLoading ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </CardContent>
  
  );
}