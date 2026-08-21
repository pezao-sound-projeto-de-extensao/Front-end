import { api } from './api';

export const usuarioService = {
  listar: async (params = {}) => {
    const response = await api.get('/usuarios', { params });
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  criar: async (data) => {
    const response = await api.post('/usuarios', data);
    return response.data;
  },

  atualizar: async (id, data) => {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
  },

  ativar: async (id) => {
    const response = await api.patch(`/usuarios/ativo/${id}`);
    return response.data;
  },
};

export default usuarioService;