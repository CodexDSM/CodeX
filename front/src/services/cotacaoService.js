const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api';

class CotacaoService {
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

  async getCotacoes({ page = 1, limit = 10, status = '', status_aprovacao = '', cliente_id = '', tipo_servico = '' } = {}) {
    try {
      const params = new URLSearchParams();
      
      if (page && page > 0) params.append('page', page.toString());
      if (limit && limit > 0) params.append('limit', limit.toString());
      if (status && status.trim()) params.append('status', status.trim());
      if (status_aprovacao && status_aprovacao.trim()) params.append('status_aprovacao', status_aprovacao.trim());
      if (cliente_id && cliente_id.trim()) params.append('cliente_id', cliente_id.trim());
      if (tipo_servico && tipo_servico.trim()) params.append('tipo_servico', tipo_servico.trim());

      const url = `${API_BASE_URL}/cotacoes${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar cotações:', error);
      throw error;
    }
  }

  async getCotacao(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotacoes/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Cotação não encontrada`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar cotação:', error);
      throw error;
    }
  }

  async calcularCotacao(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotacoes/calcular`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao calcular cotação`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao calcular cotação:', error);
      throw error;
    }
  }

  async createCotacao(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotacoes`, {
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
      console.error('Erro ao criar cotação:', error);
      throw error;
    }
  }

  async enviarEmail(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotacoes/${id}/enviar`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao enviar email`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  }

  async aprovarCotacao(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotacoes/${id}/aprovar`, {
        method: 'PATCH',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao aprovar cotação`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao aprovar cotação:', error);
      throw error;
    }
  }

  async rejeitarCotacao(id, motivo) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotacoes/${id}/rejeitar`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ motivo_rejeicao: motivo })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao rejeitar cotação`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao rejeitar cotação:', error);
      throw error;
    }
  }

  async deleteCotacao(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotacoes/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao deletar cotação`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao deletar cotação:', error);
      throw error;
    }
  }
}

export default new CotacaoService();
