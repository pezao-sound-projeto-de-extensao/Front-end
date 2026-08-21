import { api } from './api';

export const alertaService = {
  listar: async () => {
    const response = await api.get('/alertas');
    return response.data;
  },

  buscarPorTipo: async (tipo) => {
    const response = await api.get('/alertas/buscar', { params: { tipo } });
    return response.data;
  },
};

export default alertaService;