import { api } from './api';

export const orcamentoService = {
  listar: async (params = {}) => {
    const response = await api.get('/orcamentos', { params });
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/orcamentos/${id}`);
    return response.data;
  },

  criar: async (data) => {
    const response = await api.post('/orcamentos', data);
    return response.data;
  },

  atualizar: async (id, data) => {
    const response = await api.put(`/orcamentos/${id}`, data);
    return response.data;
  },

  aceitar: async (id) => {
    const response = await api.patch(`/orcamentos/${id}/aceitar`);
    return response.data;
  },

  rejeitar: async (id) => {
    const response = await api.patch(`/orcamentos/${id}/rejeitar`);
    return response.data;
  },
};

export default orcamentoService;