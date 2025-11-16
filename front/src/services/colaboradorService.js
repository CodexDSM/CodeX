const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api';

class ColaboradorService {
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

  async getColaboradores({ page = 1, limit = 10, search = '', perfil = '', ativo = '' } = {}) {
    try {
      const params = new URLSearchParams();
      
      if (page && page > 0) params.append('page', page.toString());
      if (limit && limit > 0) params.append('limit', limit.toString());
      if (search && search.trim()) params.append('search', search.trim());
      if (perfil && perfil !== '') params.append('perfil', perfil);
      if (ativo && ativo !== '') params.append('ativo', ativo);

      const url = `${API_BASE_URL}/colaboradores${params.toString() ? '?' + params.toString() : ''}`;
      
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
      
      // Adapta os dados para o formato de paginação esperado
      return {
        data: data,
        pagination: {
          current_page: 1,
          per_page: limit,
          total_records: data.length,
          total_pages: 1,
          has_next: false,
          has_prev: false
        }
      };
      
    } catch (error) {
      console.error('Erro completo:', error);
      throw error;
    }
  }

  async createColaborador(colaboradorData) {
    try {
      const response = await fetch(`${API_BASE_URL}/colaboradores`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(colaboradorData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar colaborador:', error);
      throw error;
    }
  }

  async updateColaborador(id, colaboradorData) {
    try {
      const response = await fetch(`${API_BASE_URL}/colaboradores/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(colaboradorData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar colaborador:', error);
      throw error;
    }
  }

  async deleteColaborador(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/colaboradores/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao deletar colaborador:', error);
      throw error;
    }
  }

  async getColaborador(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/colaboradores/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Colaborador não encontrado`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar colaborador:', error);
      throw error;
    }
  }
}

export default new ColaboradorService();
