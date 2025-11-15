const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api';

class ClienteService {
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Só adiciona Authorization se o token existir
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async getClientes({ page = 1, limit = 10, search = '', tipo_pessoa = '', ativo = '' } = {}) {
    try {
      const params = new URLSearchParams();
      
      // Só adiciona parâmetros que não estão vazios
      if (page && page > 0) params.append('page', page.toString());
      if (limit && limit > 0) params.append('limit', limit.toString());
      if (search && search.trim()) params.append('search', search.trim());
      if (tipo_pessoa && tipo_pessoa !== '') params.append('tipo_pessoa', tipo_pessoa);
      if (ativo && ativo !== '') params.append('ativo', ativo);

      const url = `${API_BASE_URL}/clientes${params.toString() ? '?' + params.toString() : ''}`;
      
      console.log('URL da requisição:', url);
      console.log('Headers:', this.getAuthHeaders());
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      console.log('Status da resposta:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro da API:', errorText);
        
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        if (response.status === 403) {
          throw new Error('Acesso negado. Você não tem permissão.');
        }
        if (response.status === 500) {
          throw new Error('Erro interno do servidor. Verifique o backend.');
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Dados recebidos:', data);
      return data;
      
    } catch (error) {
      console.error('Erro completo:', error);
      throw error;
    }
  }

  async createCliente(clienteData) {
    try {
      const response = await fetch(`${API_BASE_URL}/clientes`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(clienteData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  }

  async updateCliente(id, clienteData) {
    try {
      const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(clienteData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  }

  async deleteCliente(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  }

  async getCliente(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Cliente não encontrado`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      throw error;
    }
  }
}

export default new ClienteService();
