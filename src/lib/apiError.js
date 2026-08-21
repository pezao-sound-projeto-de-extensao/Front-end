import { toast } from 'sonner';

const DEFAULT_FIELD_LABELS = {
  itemId: 'Produto', quantidade: 'Quantidade', tipo: 'Tipo', data: 'Data',
  nome: 'Nome', email: 'E-mail', cargoId: 'Cargo', password: 'Senha',
  categoriaId: 'Categoria', unidadeId: 'Unidade', quantidadeMinima: 'Qtd mínima',
  precoCusto: 'Preço de custo', precoVenda: 'Preço de venda',
  clienteNome: 'Cliente', clienteTelefone: 'Telefone', status: 'Status',
  supplierName: 'Fornecedor', supplierContact: 'Contato', expectedDate: 'Previsão de entrega',
};

export function parseApiError(error, fieldLabels = {}) {
  const data = error.response?.data;
  const labels = { ...DEFAULT_FIELD_LABELS, ...fieldLabels };
  if (data?.errors) {
    const message = data.detail || 'Campos obrigatórios não preenchidos';
    const fieldErrors = {};
    const description = Object.entries(data.errors)
      .map(([campo, msg]) => `${labels[campo] || campo}: ${msg}`)
      .join('\n');
    for (const [campo, msg] of Object.entries(data.errors)) {
      fieldErrors[campo] = msg;
    }
    return { message, fieldErrors, description };
  }
  return { message: data?.detail || data?.message || error.message || 'Erro desconhecido', fieldErrors: null, description: null };
}

export function getApiErrorMessage(error, fieldLabels) {
  const { message } = parseApiError(error, fieldLabels);
  return message;
}

export function showApiError(error, fieldLabels) {
  const { message, fieldErrors, description } = parseApiError(error, fieldLabels);
  if (fieldErrors) {
    toast.error(message, { description, duration: 6000 });
  } else {
    toast.error(message);
  }
  return fieldErrors;
}

export function showApiSuccess(message) {
  toast.success(message);
}
