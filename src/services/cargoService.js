import { api } from './api';

export const cargoService = {
  listar: async () => {
    const response = await api.get('/cargos');
    return response.data;
  },
};

export default cargoService;
