const API_BASE_URL = 'http://localhost:3001/api';

class TabelaPrecoService {
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async getTabelasByCliente(clienteId, tipoServico = null, ativo = true) {
    try {
      const params = new URLSearchParams();
      if (tipoServico) params.append('tipo_servico', tipoServico);
      if (ativo !== undefined) params.append('ativo', ativo);

      const url = `${API_BASE_URL}/cotacoes/tabelas-preco/cliente/${clienteId}${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar tabelas de preço:', error);
      throw error;
    }
  }

  async buscarPreco(clienteId, tipoServico, codigoIata = null, tipoVeiculo = null) {
    try {
      const params = new URLSearchParams({
        clienteId,
        tipoServico
      });

      if (codigoIata) params.append('codigoIata', codigoIata);
      if (tipoVeiculo) params.append('tipoVeiculo', tipoVeiculo);

      const url = `${API_BASE_URL}/cotacoes/tabelas-preco/buscar?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Tabela de preço não encontrada');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar preço:', error);
      throw error;
    }
  }

  async getTabela(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotacoes/tabelas-preco/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Tabela não encontrada`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar tabela:', error);
      throw error;
    }
  }

  async createTabela(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotacoes/tabelas-preco`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar tabela:', error);
      throw error;
    }
  }

  async updateTabela(id, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotacoes/tabelas-preco/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar tabela:', error);
      throw error;
    }
  }

  async deleteTabela(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotacoes/tabelas-preco/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao deletar tabela:', error);
      throw error;
    }
  }
}

export default new TabelaPrecoService();
