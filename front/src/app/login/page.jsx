"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { getApiUrl } from '@/lib/apiConfig';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import styles from './login.module.css';




export default function LoginPage() {
  const router = useRouter();
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [localTrabalho, setLocalTrabalho] = useState('Presencial');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const locaisSelect = [
    { value: 'Presencial', label: 'Presencial' },
    { value: 'Home Office', label: 'Home Office' },
    { value: 'Evento', label: 'Evento' },
    { value: 'Treinamento', label: 'Treinamento' }
  ];

  const handleCpfChange = (event) => {
    const onlyNums = String(event.target.value).replace(/[^0-9]/g, '');
    if (onlyNums.length <= 11) setCpf(onlyNums);
  };

  const handleSenhaChange = (event) => setSenha(event.target.value);

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl('colaboradores/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf: cpf.trim(),
          senha: senha.trim(),
          local_trabalho: localTrabalho,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Ocorreu um erro desconhecido.');

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('colaborador', JSON.stringify(data.colaborador));
      localStorage.setItem('userNome', data.colaborador.nome);
      localStorage.setItem('userEmail', data.colaborador.email);
      localStorage.setItem('colaboradorId', data.colaborador.id);
      localStorage.setItem('nivelPermissao', data.colaborador.perfil);

      
      



      if (data.localizacao_registrada) {
        console.log(`Localização registrada: ${data.local_trabalho}`);
      }


      router.push('/dashboards');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <main className={styles.mainContainer}>
      <Card>
        <div className={styles.contentWrapper}>
          <form onSubmit={handleLogin}>
            <h1 className={styles.title}>Login de Colaborador</h1>
            <Input
              label='CPF'
              placeholder="Digite apenas números"
              value={cpf}
              onChange={handleCpfChange}
              required
              inputMode="numeric"
              maxLength={11}
            />
            <Input
              label='Senha'
              type="password"
              placeholder='**********'
              value={senha}
              onChange={handleSenhaChange}
              required
            />
            <div className={styles.inputWrapper}>
              <label className={styles.labelinput}>Local de Trabalho</label>
              <Select onValueChange={setLocalTrabalho} defaultValue={localTrabalho}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o local" />
                </SelectTrigger>
                <SelectContent>
                  {locaisSelect.map((local) => (
                    <SelectItem key={local.value} value={local.value}>
                      {local.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className={styles.errorMessage}>{error}</p>}
            <div className={styles.buttonContainer}>
              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </div>

            <Link className={styles.buttonContainer} href="/agregados">
              <Button
                type="button"
                variant="secondary"
              >
                Formulários
              </Button>
            </Link>
          </form>
        </div>
      </Card>
    </main>
  );
}
