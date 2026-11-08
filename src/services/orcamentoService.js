import { api } from './api';
import { createResource, data } from './resource';

export const orcamentoService = {
  ...createResource('/orcamentos', ['listar', 'buscarPorId', 'criar', 'atualizar']),
  aceitar: (id) => data(api.patch(`/orcamentos/${id}/aceitar`)),
  rejeitar: (id) => data(api.patch(`/orcamentos/${id}/rejeitar`)),
};
