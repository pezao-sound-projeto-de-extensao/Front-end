import { api } from './api';
import { createResource, data } from './resource';

export const usuarioService = {
  ...createResource('/usuarios', ['listar', 'buscarPorId', 'criar', 'atualizar']),
  /** Alterna o usuário entre ativo e inativo. */
  alternarAtivo: (id) => data(api.patch(`/usuarios/ativo/${id}`)),
};
