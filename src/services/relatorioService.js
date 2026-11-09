import { api } from './api';
import { data } from './resource';

export const relatorioService = {
  buscar: (params) => data(api.get('/relatorios', { params })),
};
