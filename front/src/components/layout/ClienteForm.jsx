"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card2 } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import styles from './funcionario.module.css';

export default function CadastroCliente() {
  const router = useRouter();

  // Estado inicial do formulário
  const initialFormData = {
    tipo_pessoa: 'F',  // 'F' = Pessoa Física, 'J' = Pessoa Jurídica
    nome: '',
    documento: '',
    email: '',
    telefone: '',
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
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const tiposPessoa = [
    { label: 'Pessoa Física', value: 'F' },
    { label: 'Pessoa Jurídica', value: 'J' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Limpar o documento ao mudar o tipo de pessoa para evitar inconsistência
      ...(name === 'tipo_pessoa' ? { documento: '' } : {})
    }));
  };

  // Validar e limitar documento conforme tipo_pessoa
  const handleDocumentoChange = (e) => {
    let onlyNums = e.target.value.replace(/[^0-9]/g, '');

    if (formData.tipo_pessoa === 'F') {
      // CPF: máximo 11 dígitos
      if (onlyNums.length <= 11) {
        setFormData(prev => ({ ...prev, documento: onlyNums }));
      }
    } else {
      // CNPJ: máximo 14 dígitos
      if (onlyNums.length <= 14) {
        setFormData(prev => ({ ...prev, documento: onlyNums }));
      }
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
      // Aqui viria a chamada API para cadastrar o cliente
      console.log('Dados do formulário:', formData);

      // Simulação de sucesso no cadastro
      setTimeout(() => {
        alert('Cliente cadastrado com sucesso!');
        router.push('/clientes'); // Ajuste a rota conforme necessário
      }, 1000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper para mostrar placeholder e label de documento dinâmicos
  const documentoLabel = formData.tipo_pessoa === 'F' ? 'CPF *' : 'CNPJ *';
  const documentoPlaceholder = formData.tipo_pessoa === 'F' ? 'Digite apenas números do CPF' : 'Digite apenas números do CNPJ';
  const documentoMaxLength = formData.tipo_pessoa === 'F' ? 11 : 14;

  return (
    <main className={styles.mainContainer}>
      <div className={styles.centerContainer}>
        <Card2 className={styles.Card2}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2 className={styles.title}>Cadastro de Cliente</h2>

            {error && <p className={styles.errorMessage}>{error}</p>}

            <div className={styles.formGrid}>

              <div className={styles.inputWrapper}>
                <label className={styles.label}>Tipo de Pessoa *</label>
                <Select 
                  onValueChange={(value) => handleSelectChange('tipo_pessoa', value)} 
                  value={formData.tipo_pessoa}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de pessoa" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposPessoa.map(({ label, value }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.label}>{documentoLabel}</label>
                <input
                  name="documento"
                  placeholder={documentoPlaceholder}
                  value={formData.documento}
                  onChange={handleDocumentoChange}
                  required
                  inputMode="numeric"
                  maxLength={documentoMaxLength}
                  className={styles.input}
                />
              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.label}>Nome *</label>
                <input
                  name="nome"
                  placeholder="Digite o nome ou razão social"
                  value={formData.nome}
                  onChange={handleChange}
                  required
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
                <label className={styles.label}>Telefone *</label>
                <input
                  name="telefone"
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
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
        </Card2>
      </div>
    </main>
  );
}
