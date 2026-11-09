import { createResource } from './resource';

export const clienteService = createResource('/clientes', ['listar', 'buscarPorId']);
