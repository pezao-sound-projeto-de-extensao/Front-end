import { api } from './api';

export const cargoService = {
  listar: async () => {
    const response = await api.get('/cargos');
    return response.data;
  },
  criar: async (data) => {
    const response = await api.post('/cargos', data);
    return response.data;
  },
  atualizar: async (id, data) => {
    const response = await api.put(`/cargos/${id}`, data);
    return response.data;
  },
};

export default cargoService;
