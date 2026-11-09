import { api } from './api';

const data = (request) => request.then((response) => response.data);

export const authService = {
  login: (email, senha) => data(api.post('/auth/login', { email, senha })),
  me: () => data(api.get('/auth/me')),
  logout: () => api.post('/auth/logout'),
  trocarSenha: ({ email, senhaAtual, senhaNova }) => data(api.post('/auth/trocar-senha', { email, senhaAtual, senhaNova })),
  resetarSenha: (id) => data(api.put(`/auth/resetar-senha/${id}`)),
  esqueciSenha: (email) => api.post('/auth/esqueci-senha', { email }),
  redefinirSenha: ({ token, senhaNova }) => api.post('/auth/redefinir-senha', { token, senhaNova }),
};
