import { api } from './api';

export const clienteService = {
  listar: async (params = {}) => {
    const response = await api.get('/clientes', { params });
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },
};

export default clienteService;