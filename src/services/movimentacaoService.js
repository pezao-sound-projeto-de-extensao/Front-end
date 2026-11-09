import { api } from './api';
import { createResource, data, uploadFile } from './resource';

export const movimentacaoService = {
  ...createResource('/movimentacoes', ['listar', 'buscarPorId', 'deletar']),
  registrar: (payload) => data(api.post('/movimentacoes', payload)),
  uploadNota: (id, arquivo) => uploadFile(`/movimentacoes/${id}/nota`, arquivo),
  baixarNota: (id) => data(api.get(`/movimentacoes/${id}/nota/download`, { responseType: 'blob' })),
  deletarNota: (id) => data(api.delete(`/movimentacoes/${id}/nota`)),
};
