import { api } from './api';

export const authService = {
  login: async (email, senha) => {
    const response = await api.post('/auth/login', { email, senha });
    return response.data;
  },

  trocarSenha: async ({ email, senhaAtual, senhaNova }) => {
    const response = await api.post('/auth/trocar-senha', { email, senhaAtual, senhaNova });
    return response.data;
  },

  resetarSenha: async (id) => {
    const response = await api.put(`/auth/resetar-senha/${id}`);
    return response.data;
  },
};

export default authService;