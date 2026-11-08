import { api } from './api';
import { createResource, data } from './resource';

export const encomendaService = {
  ...createResource('/encomendas', ['listar', 'buscarPorId']),
  kpis: () => data(api.get('/encomendas/kpis')),
  /** itemId vincula a encomenda a um produto do catálogo quando ela ainda não tem. */
  receber: (id, itemId = null) => data(api.patch(`/encomendas/${id}/receber`, itemId ? { itemId } : {})),
  concluir: (id) => data(api.patch(`/encomendas/${id}/concluir`)),
};
