const API_BASE_URL = 'http://localhost:3001/api';

class GeneralidadesService {
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

  async getGeneralidades(ativo = true) {
    try {
      const url = `${API_BASE_URL}/cotacoes/generalidades${ativo !== undefined ? `?ativo=${ativo}` : ''}`;
      
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
      console.error('Erro ao buscar generalidades:', error);
      throw error;
    }
  }

  async getGeneralidade(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotacoes/generalidades/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Generalidade não encontrada`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar generalidade:', error);
      throw error;
    }
  }

  async createGeneralidade(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotacoes/generalidades`, {
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
      console.error('Erro ao criar generalidade:', error);
      throw error;
    }
  }

  async updateGeneralidade(id, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotacoes/generalidades/${id}`, {
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
      console.error('Erro ao atualizar generalidade:', error);
      throw error;
    }
  }

  async deleteGeneralidade(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/cotacoes/generalidades/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao deletar generalidade:', error);
      throw error;
    }
  }
}

export default new GeneralidadesService();
