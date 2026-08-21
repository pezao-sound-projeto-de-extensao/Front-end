import { api } from './api';

export const movimentacaoService = {
  listar: async (params = {}) => {
    const response = await api.get('/movimentacoes', { params });
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/movimentacoes/${id}`);
    return response.data;
  },

  registrar: async (data) => {
    const response = await api.post('/movimentacoes', data);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/movimentacoes/${id}`);
    return response.data;
  },

  uploadNota: async (movimentacaoId, arquivo, tipo) => {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('tipo', tipo);
    const response = await api.post(`/movimentacoes/${movimentacaoId}/notas`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  listarNotas: async (movimentacaoId) => {
    const response = await api.get(`/movimentacoes/${movimentacaoId}/notas`);
    return response.data;
  },

  baixarNota: async (movimentacaoId, notaId) => {
    const response = await api.get(`/movimentacoes/${movimentacaoId}/notas/${notaId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  deletarNota: async (movimentacaoId, notaId) => {
    const response = await api.delete(`/movimentacoes/${movimentacaoId}/notas/${notaId}`);
    return response.data;
  },
};

export default movimentacaoService;