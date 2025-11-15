"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/apiConfig';
import styles from '@/app/(app)/operacional/checklist/checklist.module.css';

export default function FormAgregado() {
    const router = useRouter();
    
    const initialFormData = {
        nome_motorista: '',
        cnh: '',
        placa_veiculo: '',
        modelo_veiculo: '',
        telefone: '',
        email: '',
    };
    
    const [formData, setFormData] = useState(initialFormData);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePlacaChange = (e) => {
        const value = e.target.value.toUpperCase();
        setFormData(prev => ({ ...prev, placa_veiculo: value }));
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);

        try {
            const authToken = localStorage.getItem('authToken'); 
            const response = await fetch(getApiUrl('agregados'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('Agregado cadastrado com sucesso!');
                router.push('/operacional/agregados');
            } else {
                const err = await response.json();
                alert('Erro ao cadastrar agregado: ' + (err.message || 'Erro desconhecido'));
            }
        } catch (error) {
            alert('Erro ao conectar com o servidor: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                <div>
                    <label className={styles.formLabel}>Nome do Motorista *</label>
                    <input
                        name="nome_motorista"
                        placeholder="Digite o nome completo"
                        value={formData.nome_motorista}
                        onChange={handleChange}
                        required
                        className={styles.textInput}
                    />
                </div>
                <div>
                    <label className={styles.formLabel}>CNH *</label>
                    <input
                        name="cnh"
                        placeholder="Digite a CNH"
                        value={formData.cnh}
                        onChange={handleChange}
                        required
                        className={styles.textInput}
                    />
                </div>
                <div>
                    <label className={styles.formLabel}>Placa do Veículo *</label>
                    <input
                        name="placa_veiculo"
                        placeholder="ABC1234"
                        value={formData.placa_veiculo}
                        onChange={handlePlacaChange}
                        required
                        maxLength={7}
                        className={styles.textInput}
                    />
                </div>
                <div>
                    <label className={styles.formLabel}>Modelo do Veículo *</label>
                    <input
                        name="modelo_veiculo"
                        placeholder="Ex: Volvo FH 540"
                        value={formData.modelo_veiculo}
                        onChange={handleChange}
                        required
                        className={styles.textInput}
                    />
                </div>
                <div>
                    <label className={styles.formLabel}>Telefone</label>
                    <input
                        name="telefone"
                        placeholder="(00) 00000-0000"
                        value={formData.telefone}
                        onChange={handleChange}
                        className={styles.textInput}
                    />
                </div>
                <div>
                    <label className={styles.formLabel}>E-mail</label>
                    <input
                        name="email"
                        type="email"
                        placeholder="exemplo@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={styles.textInput}
                    />
                </div>
            </div>

            {/* O botão "Voltar" foi removido desta seção */}
            <div className={styles.formActions} style={{marginTop: '2rem'}}>
                <button type="submit" className={styles.submitButton} disabled={isLoading}>
                    {isLoading ? 'Cadastrando...' : 'Cadastrar Agregado'}
                </button>
            </div>
        </form>
    );
}