import { api } from './api';

export const permissaoService = {
  listar: async () => {
    const response = await api.get('/permissoes');
    return response.data;
  },
};

export default permissaoService;
