import { api } from './api';
import { absoluteUrl, createResource, data, uploadFile } from './resource';

export const itemService = {
  ...createResource('/itens', ['listar', 'buscarPorId', 'criar', 'atualizar']),
  inativar: (id) => data(api.patch(`/itens/${id}/inativar`)),
  reativar: (id) => data(api.patch(`/itens/${id}/reativar`)),
};

export const imagemProdutoService = {
  upload: (itemId, arquivo) => uploadFile(`/itens/${itemId}/imagem`, arquivo),
  deletar: (itemId) => data(api.delete(`/itens/${itemId}/imagem`)),
  /** tipo: 'icon' (miniatura) ou 'full' */
  url: (itemId, tipo = 'full') => absoluteUrl(`/itens/${itemId}/imagem/download?tipo=${tipo}`),
};
