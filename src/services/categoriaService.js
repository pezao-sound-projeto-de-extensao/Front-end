import { createResource } from './resource';

export const categoriaService = createResource('/categorias', ['listar', 'criar', 'atualizar', 'deletar']);
