import { api } from './api';

export const pedidoService = {
  listar: async (params = {}) => {
    const response = await api.get('/pedidos', { params });
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/pedidos/${id}`);
    return response.data;
  },

  criar: async (data) => {
    const response = await api.post('/pedidos', data);
    return response.data;
  },

  atualizar: async (id, data) => {
    const response = await api.put(`/pedidos/${id}`, data);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/pedidos/${id}`);
    return response.data;
  },
};

export default pedidoService;
