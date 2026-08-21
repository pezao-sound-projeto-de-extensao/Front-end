import { api } from './api';

export const relatorioService = {
  buscar: async (params) => {
    const response = await api.get('/relatorios', { params });
    return response.data;
  },
};

export default relatorioService;