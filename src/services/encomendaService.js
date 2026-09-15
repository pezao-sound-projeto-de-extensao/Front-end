import { api } from './api';

export const encomendaService = {
  listar: async (params = {}) => {
    const response = await api.get('/encomendas', { params });
    return response.data;
  },

  kpis: async () => {
    const response = await api.get('/encomendas/kpis');
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/encomendas/${id}`);
    return response.data;
  },

  receber: async (id, itemId = null) => {
    const response = await api.patch(`/encomendas/${id}/receber`, itemId ? { itemId } : {});
    return response.data;
  },

  concluir: async (id) => {
    const response = await api.patch(`/encomendas/${id}/concluir`);
    return response.data;
  },
};

export default encomendaService;