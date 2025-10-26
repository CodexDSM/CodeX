'use client'; // Necessário para usar hooks como useState e useEffect

import React, { useState, useEffect } from 'react';
import { mockTemplates } from '../listaChecklists';
import styles from './checklist.module.css';
import FormAgregado from '@/components/layout/FormAgregado'; // Supondo que este seja o caminho correto

// --- Componentes de Ícones (para manter o código limpo) ---
const CheckIcon = () => (
  <svg className={styles.statusSuccess} style={{ height: '1.25rem', width: '1.25rem' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
);
const SpinnerIcon = () => (
  <svg style={{ height: '1.25rem', width: '1.25rem' }} className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
);

// --- Componente Principal da Página ---
export default function ChecklistPage() {
  // --- CONFIGURAÇÃO DA API ---
  const API_BASE_URL = 'http://localhost:3001';
  const UPLOAD_ENDPOINT = `${API_BASE_URL}/api/files/upload`;
  const SUBMIT_ENDPOINT = `${API_BASE_URL}/api/checklists/responses`;

  // --- Estados do Componente ---
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [fileUploads, setFileUploads] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState('idle');

  useEffect(() => {
    // Fetch para API futuramente
    setTemplates(mockTemplates);
  }, []);

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    const template = templates.find(t => t.id.toString() === templateId);
    setSelectedTemplate(template);
    setFormValues({});
    setFileUploads({});
  };

  const handleInputChange = (questionId, value) => {
    setFormValues(prev => ({ ...prev, [questionId]: value }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      const fileId = `${file.name}-${file.lastModified}`;
      setFileUploads(prev => ({ ...prev, [fileId]: { name: file.name, status: 'uploading' } }));

      const formData = new FormData();
      formData.append('anexo', file);

      try {
        const response = await fetch(UPLOAD_ENDPOINT, { method: 'POST', body: formData });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Falha no upload');
        setFileUploads(prev => ({ ...prev, [fileId]: { ...prev[fileId], status: 'success', path: result.filePath } }));
      } catch (error) {
        setFileUploads(prev => ({ ...prev, [fileId]: { ...prev[fileId], status: 'error', message: error.message } }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus('loading');

    const respostas = Object.entries(formValues).map(([key, value]) => ({
      pergunta_id: parseInt(key, 10),
      valor_resposta: value,
    }));

    const filePaths = Object.values(fileUploads)
      .filter(f => f.status === 'success')
      .map(f => f.path);

    const payload = {
      template_id: selectedTemplate.id,
      colaborador_id: 1, // MOCK: Trocar pelo ID do utilizador logado
      respostas: respostas,
      filePaths: filePaths,
    };

    try {
      const response = await fetch(SUBMIT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Falha ao enviar o checklist.');
      setSubmissionStatus('success');
    } catch (error) {
      alert(`Erro: ${error.message}`);
      setSubmissionStatus('error');
    }
  };

  const resetPage = () => {
    setSelectedTemplate(null);
    setFormValues({});
    setFileUploads({});
    setSubmissionStatus('idle');
  };

  const renderContent = () => {
    if (submissionStatus === 'success') {
      return (
        <div className={styles.successContainer}>
          <h2 className={styles.title}>Enviado com Sucesso!</h2>
          <p className={styles.description}>O checklist foi registado na plataforma.</p>
          <button onClick={resetPage} className={styles.submitButton}>Preencher Outro Checklist</button>
        </div>
      );
    }
    if (!selectedTemplate) {
      return (
        <div>
          <h1 className={styles.title}>Checklists Operacionais</h1>
          <p className={styles.description}>Selecione o formulário que deseja preencher para começar.</p>
          <label htmlFor="checklist-template" className={styles.formLabel}>Tipo de Checklist *</label>
          <select id="checklist-template" onChange={handleTemplateChange} defaultValue="" className={styles.selectInput}>
            <option value="" disabled>-- Escolha um formulário --</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </select>
        </div>
      );
    }

    // --- NOVO BLOCO ADICIONADO AQUI ---
    // Verifica se o template selecionado é o de agregado. Se for, mostra o formulário estático.
    if (selectedTemplate.id === 'agregado_form') {
      return (
        <div>
          <h1 className={styles.title}>{selectedTemplate.name}</h1>
          <p className={styles.description}>{selectedTemplate.description}</p>

          <FormAgregado />
        </div>
      );
    }
    // --- FIM DO NOVO BLOCO ---

    // Se não for o de agregado, continua com a lógica original para os outros checklists.
    return (
      <div>
        <h1 className={styles.title}>{selectedTemplate.name}</h1>
        <p className={styles.description}>{selectedTemplate.description}</p>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {selectedTemplate.questions.map(q => renderInput(q))}
          </div>
          <div className={styles.formActions}>
            <button type="button" onClick={resetPage} className={styles.backButton}>Voltar</button>
            <button type="submit" disabled={submissionStatus === 'loading'} className={styles.submitButton}>
              {submissionStatus === 'loading' ? 'A enviar...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderInput = (q) => {
    switch (q.tipo_pergunta) {
      case 'TEXTO':
        return <div key={q.id}><label className={styles.formLabel}>{q.texto_pergunta}</label><input type="text" value={formValues[q.id] || ''} onChange={e => handleInputChange(q.id, e.target.value)} required={q.obrigatoria} className={styles.textInput} /></div>;
      case 'NUMERO':
        return <div key={q.id}><label className={styles.formLabel}>{q.texto_pergunta}</label><input type="number" value={formValues[q.id] || ''} onChange={e => handleInputChange(q.id, e.target.value)} required={q.obrigatoria} className={styles.textInput} /></div>;
      case 'DATA':
        return <div key={q.id}><label className={styles.formLabel}>{q.texto_pergunta}</label><input type="date" value={formValues[q.id] || ''} onChange={e => handleInputChange(q.id, e.target.value)} required={q.obrigatoria} className={styles.textInput} /></div>;
      case 'TEXTO_LONGO':
        return <div key={q.id}><label className={styles.formLabel}>{q.texto_pergunta}</label><textarea value={formValues[q.id] || ''} onChange={e => handleInputChange(q.id, e.target.value)} required={q.obrigatoria} className={styles.textarea}></textarea></div>;
      case 'SIM_NAO':
        return (<div key={q.id}><label className={styles.formLabel}>{q.texto_pergunta}</label><div className={styles.radioGroup}><label className={styles.radioLabel}><input type="radio" name={`q_${q.id}`} value="true" onChange={e => handleInputChange(q.id, e.target.value)} required={q.obrigatoria} className={styles.radioInput} /><span className={styles.radioText}>Sim</span></label><label className={styles.radioLabel}><input type="radio" name={`q_${q.id}`} value="false" onChange={e => handleInputChange(q.id, e.target.value)} required={q.obrigatoria} className={styles.radioInput} /><span className={styles.radioText}>Não</span></label></div></div>);
      case 'ARQUIVO':
        return (<div key={q.id}><label className={styles.formLabel}>{q.texto_pergunta}</label><div className={styles.fileUploadBox}><label htmlFor={`q_${q.id}`} className={styles.fileUploadLabel}><span>Carregar ficheiros</span><input id={`q_${q.id}`} type="file" style={{ display: 'none' }} multiple accept="image/png, image/jpeg" onChange={handleFileUpload} /></label><p>ou arraste e solte</p></div><div className={styles.fileList}>{Object.values(fileUploads).map(file => (<div key={file.name} className={styles.fileListItem}><span>{file.name}</span><div className={styles.fileStatus}>{file.status === 'uploading' && <><SpinnerIcon /> <span className={styles.statusUploading}>A enviar...</span></>}{file.status === 'success' && <><CheckIcon /> <span className={styles.statusSuccess}>Enviado</span></>}{file.status === 'error' && <span className={styles.statusError}>Erro</span>}</div></div>))}</div></div>);
      default: return null;
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        {renderContent()}
      </div>
    </main>
  );
}

