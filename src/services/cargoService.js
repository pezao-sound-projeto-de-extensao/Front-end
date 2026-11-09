import { createResource } from './resource';

export const cargoService = createResource('/cargos', ['listar', 'criar', 'atualizar']);
