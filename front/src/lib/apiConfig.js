// Configuração centralizada da URL da API
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
export const API_URL = API_BASE_URL + '/api';

// Helper para construir URLs da API
export const getApiUrl = (path) => {
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_URL}/${cleanPath}`;
};

// Helper para obter headers padrão com autenticação
export const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
};