import { createResource } from './resource';

export const unidadeService = createResource('/unidades', ['listar', 'criar', 'atualizar', 'deletar']);
