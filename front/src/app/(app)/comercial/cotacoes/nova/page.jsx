"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calculator } from "lucide-react";
import styles from "./novaCotacao.module.css";
import cotacaoService from "@/services/cotacaoService";
import clienteService from "@/services/clienteService";
import generalidadesService from "@/services/generalidadesService";

const CODIGOS_IATA = [
  { codigo: 'GRU', nome: 'São Paulo - Guarulhos' },
  { codigo: 'CGH', nome: 'São Paulo - Congonhas' },
  { codigo: 'VCP', nome: 'Campinas - Viracopos' },
  { codigo: 'BSB', nome: 'Brasília' },
  { codigo: 'GIG', nome: 'Rio de Janeiro - Galeão' },
  { codigo: 'SDU', nome: 'Rio de Janeiro - Santos Dumont' },
  { codigo: 'CNF', nome: 'Belo Horizonte - Confins' },
  { codigo: 'SSA', nome: 'Salvador' },
  { codigo: 'REC', nome: 'Recife' },
  { codigo: 'FOR', nome: 'Fortaleza' },
  { codigo: 'CWB', nome: 'Curitiba' },
  { codigo: 'POA', nome: 'Porto Alegre' },
  { codigo: 'MAO', nome: 'Manaus' },
  { codigo: 'BEL', nome: 'Belém' },
  { codigo: 'FLN', nome: 'Florianópolis' }
];

export default function NovaCotacaoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [generalidades, setGeneralidades] = useState([]);
  const [iataPersonalizado, setIataPersonalizado] = useState(false);
  
  const [formData, setFormData] = useState({
    cliente_id: '',
    tipo_servico: '',
    origem: '',
    destino: '',
    codigo_iata_destino: '',
    peso_kg: '',
    km_percorrido: '',
    tipo_veiculo: '',
    valor_frete_agregado: '',
    valor_km_agregado: '',
    generalidades_ids: [],
    observacoes: '',
    enviar_email: false
  });

  const [calculos, setCalculos] = useState(null);
  const [calculando, setCalculando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    fetchClientes();
    fetchGeneralidades();
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await clienteService.getClientes({ limit: 1000 });
      setClientes(response.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const fetchGeneralidades = async () => {
    try {
      const response = await generalidadesService.getGeneralidades(true);
      setGeneralidades(response.data);
    } catch (error) {
      console.error('Erro ao carregar generalidades:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = type === 'checkbox' ? checked : value;
    
    if (name === 'codigo_iata_destino') {
      processedValue = value.toUpperCase();
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleGeneralidadeToggle = (id) => {
    setFormData(prev => ({
      ...prev,
      generalidades_ids: prev.generalidades_ids.includes(id)
        ? prev.generalidades_ids.filter(gId => gId !== id)
        : [...prev.generalidades_ids, id]
    }));
  };

  const calcularCotacao = async () => {
    setCalculando(true);
    setErro('');
    try {
      const response = await cotacaoService.calcularCotacao({
        clienteId: formData.cliente_id,
        tipoServico: formData.tipo_servico,
        pesoKg: parseFloat(formData.peso_kg) || 0,
        kmPercorrido: parseFloat(formData.km_percorrido) || 0,
        codigoIata: formData.codigo_iata_destino,
        tipoVeiculo: formData.tipo_veiculo,
        generalidadesIds: formData.generalidades_ids,
        valorFreteAgregado: parseFloat(formData.valor_frete_agregado) || 0,
        valorKmAgregado: parseFloat(formData.valor_km_agregado) || 0
      });
      setCalculos(response.data);
    } catch (error) {
      if (!error.message.includes('Tabela de preços não encontrada')) {
        console.error('Erro ao calcular cotação:', error);
      }
      setErro(error.message);
      setCalculos(null);
    } finally {
      setCalculando(false);
    }
  };

  useEffect(() => {
    if (formData.cliente_id && formData.tipo_servico) {
      const timer = setTimeout(() => {
        calcularCotacao();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    formData.cliente_id,
    formData.tipo_servico,
    formData.peso_kg,
    formData.km_percorrido,
    formData.codigo_iata_destino,
    formData.tipo_veiculo,
    formData.valor_frete_agregado,
    formData.valor_km_agregado,
    JSON.stringify(formData.generalidades_ids)
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      await cotacaoService.createCotacao(formData);
      alert('Cotação criada com sucesso!');
      router.push('/comercial/cotacoes');
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Nova Cotação de Frete</h1>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <div className={styles.mainColumn}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Dados Básicos</h2>
              
              <div className={styles.field}>
                <label className={styles.label}>Cliente *</label>
                <select
                  name="cliente_id"
                  value={formData.cliente_id}
                  onChange={handleChange}
                  required
                  className={styles.select}
                >
                  <option value="">Selecione o cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Tipo de Serviço *</label>
                <select
                  name="tipo_servico"
                  value={formData.tipo_servico}
                  onChange={handleChange}
                  required
                  className={styles.select}
                >
                  <option value="">Selecione o tipo</option>
                  <option value="WEAir Convencional">WEAir Convencional</option>
                  <option value="WEAir Expresso">WEAir Expresso</option>
                  <option value="WEAir Proximo Voo">WEAir Próximo Voo</option>
                  <option value="LT WEAir NEWE">LT WEAir NEWE</option>
                  <option value="WExpress">WExpress</option>
                </select>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Origem *</label>
                  <input
                    type="text"
                    name="origem"
                    value={formData.origem}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="Cidade de origem"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Destino *</label>
                  <input
                    type="text"
                    name="destino"
                    value={formData.destino}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="Cidade de destino"
                  />
                </div>
              </div>

              {formData.tipo_servico && formData.tipo_servico.includes('WEAir') && (
                <>
                  <div className={styles.field}>
                    <label className={styles.label}>Código IATA Destino</label>
                    
                    {!iataPersonalizado ? (
                      <div className={styles.iataContainer}>
                        <select
                          name="codigo_iata_destino"
                          value={formData.codigo_iata_destino}
                          onChange={handleChange}
                          className={styles.select}
                        >
                          <option value="">Selecione o aeroporto</option>
                          {CODIGOS_IATA.map(iata => (
                            <option key={iata.codigo} value={iata.codigo}>
                              {iata.codigo} - {iata.nome}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            setIataPersonalizado(true);
                            setFormData(prev => ({ ...prev, codigo_iata_destino: '' }));
                          }}
                          className={styles.outroButton}
                        >
                          Outro
                        </button>
                      </div>
                    ) : (
                      <div className={styles.iataContainer}>
                        <input
                          type="text"
                          name="codigo_iata_destino"
                          value={formData.codigo_iata_destino}
                          onChange={handleChange}
                          className={styles.input}
                          placeholder="Digite o código IATA"
                          maxLength={3}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIataPersonalizado(false);
                            setFormData(prev => ({ ...prev, codigo_iata_destino: '' }));
                          }}
                          className={styles.voltarButton}
                        >
                          Voltar
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Peso (kg) *</label>
                    <input
                      type="number"
                      name="peso_kg"
                      value={formData.peso_kg}
                      onChange={handleChange}
                      required
                      step="0.01"
                      min="0"
                      className={styles.input}
                      placeholder="0.00"
                    />
                  </div>
                </>
              )}

              {formData.tipo_servico === 'WExpress' && (
                <div className={styles.field}>
                  <label className={styles.label}>Tipo de Veículo *</label>
                  <select
                    name="tipo_veiculo"
                    value={formData.tipo_veiculo}
                    onChange={handleChange}
                    required
                    className={styles.select}
                  >
                    <option value="">Selecione</option>
                    <option value="Fiorino">Fiorino (0-550 kg)</option>
                    <option value="Van">Van (600-1200 kg)</option>
                    <option value="VUC">VUC (1200-3000 kg)</option>
                    <option value="03/04">03/04 (3000-6000 kg)</option>
                    <option value="Truck">Truck (6000-14000 kg)</option>
                    <option value="Carreta 2 eixos">Carreta 2 eixos (14000-33000 kg)</option>
                    <option value="Carreta 3 eixos">Carreta 3 eixos (33000-41000 kg)</option>
                    <option value="Carreta Cavalo Trucado">Carreta Cavalo Trucado (41000-45000 kg)</option>
                    <option value="Carreta Prancha">Carreta Prancha (45000-50000 kg)</option>
                  </select>
                </div>
              )}

              {formData.tipo_servico && (
                <div className={styles.field}>
                  <label className={styles.label}>
                    KM Percorrido {formData.tipo_servico === 'WExpress' && '*'}
                  </label>
                  <input
                    type="number"
                    name="km_percorrido"
                    value={formData.km_percorrido}
                    onChange={handleChange}
                    required={formData.tipo_servico === 'WExpress'}
                    step="0.01"
                    min="0"
                    className={styles.input}
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Valores Agregado</h2>
              
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Valor Frete Agregado (R$)</label>
                  <input
                    type="number"
                    name="valor_frete_agregado"
                    value={formData.valor_frete_agregado}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={styles.input}
                    placeholder="0.00"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Valor por KM Agregado (R$)</label>
                  <input
                    type="number"
                    name="valor_km_agregado"
                    value={formData.valor_km_agregado}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={styles.input}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Generalidades</h2>
              <div className={styles.generalidadesList}>
                {generalidades.map(gen => (
                  <label key={gen.id} className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={formData.generalidades_ids.includes(gen.id)}
                      onChange={() => handleGeneralidadeToggle(gen.id)}
                    />
                    <span>
                      {gen.nome} - {gen.tipo === 'fixo' ? `R$ ${parseFloat(gen.valor).toFixed(2)}` : `${gen.valor}%`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Observações</h2>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                className={styles.textarea}
                rows={4}
                placeholder="Observações adicionais..."
              />
            </div>

            <div className={styles.actions}>
              <label className={styles.checkboxField}>
                <input
                  type="checkbox"
                  name="enviar_email"
                  checked={formData.enviar_email}
                  onChange={handleChange}
                />
                <span>Enviar por email imediatamente</span>
              </label>

              {erro && <div className={styles.error}>{erro}</div>}

              <div className={styles.buttons}>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className={styles.cancelButton}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !calculos}
                  className={styles.submitButton}
                >
                  {loading ? 'Salvando...' : formData.enviar_email ? 'Criar e Enviar' : 'Criar Cotação'}
                </button>
              </div>
            </div>
          </div>

          <div className={styles.sideColumn}>
            <div className={styles.calculoCard}>
              <div className={styles.calculoHeader}>
                <Calculator size={20} />
                <h2>Resumo do Cálculo</h2>
              </div>

              {calculando && <div className={styles.calculando}>Calculando...</div>}

              {erro && !calculando && (
                <div className={styles.calculoErroContainer}>
                  <div className={styles.calculoErro}>{erro}</div>
                  {erro.includes('Tabela de preços não encontrada') && (
                    <a
                      href="/comercial/cotacoes/tabelas"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.criarTabelaButton}
                    >
                      + Criar Tabela de Preços
                    </a>
                  )}
                </div>
              )}

              {calculos && !calculando && (
                <div className={styles.calculoContent}>
                  <div className={styles.calculoRow}>
                    <span>Valor Base:</span>
                    <span className={styles.calculoValor}>
                      R$ {parseFloat(calculos.valorBase).toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  {calculos.valorGeneralidades > 0 && (
                    <div className={styles.calculoRow}>
                      <span>Generalidades:</span>
                      <span className={styles.calculoValor}>
                        R$ {parseFloat(calculos.valorGeneralidades).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}

                  <div className={styles.calculoDivider}></div>

                  <div className={styles.calculoRow}>
                    <span className={styles.calculoLabel}>Valor Cliente:</span>
                    <span className={styles.calculoDestaque}>
                      R$ {parseFloat(calculos.valorCliente).toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className={styles.calculoDivider}></div>

                  <div className={styles.calculoRow}>
                    <span>Valor Agregado:</span>
                    <span className={styles.calculoValor}>
                      R$ {parseFloat(calculos.valorAgregado).toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className={styles.calculoRow}>
                    <span className={styles.calculoLabel}>Rentabilidade:</span>
                    <span className={styles.calculoRentabilidade}>
                      R$ {parseFloat(calculos.valorRentabilidade).toFixed(2).replace('.', ',')}
                      ({parseFloat(calculos.percentualRentabilidade).toFixed(2)}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
