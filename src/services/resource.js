import { api, API_BASE_URL } from './api';

/** Executa a requisição e devolve só o corpo da resposta. */
export const data = (request) => request.then((response) => response.data);

/**
 * Operações REST padrão de um recurso. Passe só as que o back-end expõe:
 *   createResource('/cargos', ['listar', 'criar', 'atualizar'])
 */
export function createResource(basePath, operations) {
  const all = {
    listar: (params = {}) => data(api.get(basePath, { params })),
    buscarPorId: (id) => data(api.get(`${basePath}/${id}`)),
    criar: (payload) => data(api.post(basePath, payload)),
    atualizar: (id, payload) => data(api.put(`${basePath}/${id}`, payload)),
    deletar: (id) => data(api.delete(`${basePath}/${id}`)),
  };
  return Object.fromEntries(operations.map((name) => [name, all[name]]));
}

export function uploadFile(url, arquivo) {
  const formData = new FormData();
  formData.append('arquivo', arquivo);
  return data(api.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } }));
}

/** URL absoluta para usar direto em <img src>, já que o navegador envia o cookie. */
export const absoluteUrl = (path) => `${API_BASE_URL}${path}`;
