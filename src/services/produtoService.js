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

export const imagemProdutoService = {
  upload: async (itemId, arquivo, principal = false) => {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('principal', principal);
    const response = await api.post(`/itens/${itemId}/imagens`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  listar: async (itemId) => {
    const response = await api.get(`/itens/${itemId}/imagens`);
    return response.data;
  },

  deletar: async (itemId, imagemId) => {
    const response = await api.delete(`/itens/${itemId}/imagens/${imagemId}`);
    return response.data;
  },

  definirPrincipal: async (itemId, imagemId) => {
    const response = await api.patch(`/itens/${itemId}/imagens/${imagemId}/principal`);
    return response.data;
  },
};

export default { categoriaService, unidadeService, imagemProdutoService };