import { api } from './api';

export const categoriaService = {
  listar: async () => {
    const response = await api.get('/categorias');
    return response.data;
  },

  criar: async (data) => {
    const response = await api.post('/categorias', data);
    return response.data;
  },

  atualizar: async (id, data) => {
    const response = await api.put(`/categorias/${id}`, data);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/categorias/${id}`);
    return response.data;
  },
};

export const unidadeService = {
  listar: async () => {
    const response = await api.get('/unidades');
    return response.data;
  },

  criar: async (data) => {
    const response = await api.post('/unidades', data);
    return response.data;
  },

  atualizar: async (id, data) => {
    const response = await api.put(`/unidades/${id}`, data);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/unidades/${id}`);
    return response.data;
  },
};

let baseUrlCache = null;

const getBaseUrl = () => {
  if (!baseUrlCache) {
    baseUrlCache = typeof window !== 'undefined' 
      ? (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
      : '';
  }
  return baseUrlCache;
};

export const imagemProdutoService = {
  upload: async (itemId, arquivo) => {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    const response = await api.post(`/itens/${itemId}/imagem`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deletar: async (itemId) => {
    const response = await api.delete(`/itens/${itemId}/imagem`);
    return response.data;
  },

  baixarUrl: (itemId, tipo = 'full') => {
    return `/itens/${itemId}/imagem/download?tipo=${tipo}`;
  },

  getIconUrl: (itemId) => {
    const base = getBaseUrl();
    return base ? `${base}/itens/${itemId}/imagem/download?tipo=icon` : null;
  },

  getFullUrl: (itemId) => {
    const base = getBaseUrl();
    return base ? `${base}/itens/${itemId}/imagem/download?tipo=full` : null;
  },
};

export default { categoriaService, unidadeService, imagemProdutoService };