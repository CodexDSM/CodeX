"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { testeClientes } from './listaClientes';
import styles from '../../../administrativo/colaboradores/[id]/detalhe.module.css'; 
import { Edit, Save, XCircle } from 'lucide-react';


// 2. Renomeia o componente para refletir que é sobre Clientes
export default function DetalheClientePage({ params }) {
  const router = useRouter();
  const clienteId = params.id;
    
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
  
    const cliente = testeClientes.find(
      (cli) => cli.id.toString() === clienteId
    );
    if (cliente) {
      setFormData(cliente);
      setInitialData(cliente);
    }
  }, [clienteId]);

  if (!formData) {
    return <div>Carregando...</div>;
  }
 const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

const handleEditClick = () => {
  setIsEditing(true); // Libera os campos para edição
};

const handleCancelClick = () => {
  setFormData(initialData); // Restaura os dados originais
  setIsEditing(false); // Trava os campos novamente
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  console.log("Salvando dados:", formData);
  setInitialData(formData); // Atualiza o estado inicial com os novos dados
  setIsEditing(false); 
  alert("Dados salvos com sucesso!");
};



return (
  <div className={styles.container}>
    <form onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h1 className={styles.nome}>Detalhes do Cliente</h1>
        
        {/* LÓGICA DOS BOTÕES */}
        {isEditing ? (
          <div className={styles.actionButtons}>
            <button type="button" onClick={handleCancelClick} className={styles.cancelButton}>
              <XCircle size={18} /> Cancelar
            </button>
            <button type="submit" className={styles.saveButton}>
              <Save size={18} /> Salvar
            </button>
          </div>
        ) : (
          <button type="button" onClick={handleEditClick} className={styles.editButton}>
            <Edit size={18} /> Editar
          </button>
        )}
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Nome Completo</label>
          <input
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            readOnly={!isEditing} 
            className={styles.input}
          />
        </div>
        
        <div className={styles.inputWrapper}>
          <label className={styles.label}>CPF</label>
          <input
            name="CPF"
            value={formData.cpf}
            onChange={handleChange}
            readOnly={!isEditing} 
            className={styles.input}
          />
        </div>

        <div className={styles.inputWrapper}>
          <label className={styles.label}>E-mail</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            readOnly={!isEditing} 
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
                readOnly={!isEditing}
                className={styles.input}
              />
        </div>

        <div className={styles.inputWrapper}>
            <label className={styles.label}>Tipo de pessoa</label>
              <input
                name="tipo"
                placeholder="Pessoa fisica"
                value={formData.tipo}
                onChange={handleChange}
                readOnly={!isEditing}
                className={styles.input}
              />
        </div>

        <h3></h3>
        
        <h3 className={styles.subtitle}>Endereço</h3>
        <h3></h3>
        
        


            
              <div className={styles.inputWrapper}>
                <label className={styles.label}>CEP </label>
                <input
                  name="cep"
                  placeholder="Digite apenas números"
                  value={formData.cep}
                  onChange={handleChange}
                   readOnly={!isEditing}
                  inputMode="numeric"
                  maxLength={8}
                  className={styles.input}
                />
              </div>

              <div className={`${styles.inputWrapper} ${styles.span2}`}>
                <label className={styles.label}>Logradouro </label>
                <input
                  name="logradouro"
                  placeholder="Rua, Avenida, etc."
                  value={formData.logradouro}
                  onChange={handleChange}
                   readOnly={!isEditing}
                  className={styles.input}
                />
              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.label}>Número </label>
                <input
                  name="numero"
                  placeholder="Número"
                  value={formData.numero}
                  onChange={handleChange}
                  readOnly={!isEditing}
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
                   readOnly={!isEditing}
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
                   readOnly={!isEditing}
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
                   readOnly={!isEditing}
                  className={styles.input}
                />
              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.label}>UF</label>
                <input
                  name="UF"
                  placeholder="SP"
                  value={formData.cidade}
                  onChange={handleChange}
                   readOnly={!isEditing}
                  className={styles.input}
                />
              </div>
            
        
      </div>
    </form>
  </div>
)

}