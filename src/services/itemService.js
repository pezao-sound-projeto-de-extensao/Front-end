import { api } from './api';

export const itemService = {
  listar: async (params = {}) => {
    const response = await api.get('/itens', { params });
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/itens/${id}`);
    return response.data;
  },

  criar: async (data) => {
    const response = await api.post('/itens', data);
    return response.data;
  },

  atualizar: async (id, data) => {
    const response = await api.put(`/itens/${id}`, data);
    return response.data;
  },

  inativar: async (id) => {
    const response = await api.patch(`/itens/${id}/inativar`);
    return response.data;
  },

  reativar: async (id) => {
    const response = await api.patch(`/itens/${id}/reativar`);
    return response.data;
  },
};

export default itemService;