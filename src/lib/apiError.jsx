import { toast } from 'sonner';
import {
  AlertTriangle,
  XCircle,
  Search,
  AlertCircle,
  Ban,
  Server,
} from 'lucide-react';

export const ERROR_TYPES = {
  VALIDATION: 'validation',
  BUSINESS_ERROR: 'business_error',
  NOT_FOUND: 'not_found',
  CONFLICT: 'conflict',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  SERVER_ERROR: 'server_error',
};

const ERROR_ICONS = {
  [ERROR_TYPES.VALIDATION]: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  [ERROR_TYPES.BUSINESS_ERROR]: <XCircle className="w-5 h-5 text-red-500" />,
  [ERROR_TYPES.NOT_FOUND]: <Search className="w-5 h-5 text-blue-500" />,
  [ERROR_TYPES.CONFLICT]: <AlertCircle className="w-5 h-5 text-orange-500" />,
  [ERROR_TYPES.FORBIDDEN]: <Ban className="w-5 h-5 text-purple-500" />,
  [ERROR_TYPES.SERVER_ERROR]: <Server className="w-5 h-5 text-red-600" />,
};

const TOAST_DURATIONS = {
  [ERROR_TYPES.VALIDATION]: 6000,
  [ERROR_TYPES.BUSINESS_ERROR]: 5000,
  [ERROR_TYPES.NOT_FOUND]: 4000,
  [ERROR_TYPES.CONFLICT]: 5000,
  [ERROR_TYPES.FORBIDDEN]: 4000,
  [ERROR_TYPES.SERVER_ERROR]: 6000,
};

const DEFAULT_FIELD_LABELS = {
  nome: 'Nome',
  email: 'E-mail',
  cargoId: 'Cargo',
  cargo_id: 'Cargo',
  password: 'Senha',
  senha: 'Senha',
  senhaAtual: 'Senha atual',
  senhaNova: 'Nova senha',
  ativo: 'Status',
  categoriaId: 'Categoria',
  unidadeId: 'Unidade',
  quantidadeAtual: 'Quantidade atual',
  quantidadeMinima: 'Quantidade mínima',
  precoCusto: 'Preço de custo',
  precoVenda: 'Preço de venda',
  clienteNome: 'Cliente',
  clienteTelefone: 'Telefone',
  clienteId: 'Cliente',
  status: 'Status',
  supplierName: 'Fornecedor',
  supplierContact: 'Contato',
  expectedDate: 'Previsão de entrega',
  observacao: 'Observação',
  descricao: 'Descrição',
  precoUnitario: 'Preço unitário',
  abreviacao: 'Abreviação',
  permissoes: 'Permissões',
  quantidade: 'Quantidade',
  tipo: 'Tipo',
  data: 'Data',
  itemId: 'Produto',
  date: 'Data',
  number: 'Número',
};

function normalizeFieldKey(key) {
  return key.replace(/\[(\d+)\]/g, '.$1').replace(/^itens\./, 'itens.').replace(/^itens\[(\d+)\]/g, 'itens.$1');
}

function getFieldLabel(fieldKey, customLabels) {
  const normalized = normalizeFieldKey(fieldKey);
  const labels = { ...DEFAULT_FIELD_LABELS, ...customLabels };

  if (labels[normalized]) return labels[normalized];

  const parts = normalized.split('.');
  for (let i = parts.length; i > 0; i--) {
    const partial = parts.slice(0, i).join('.');
    if (labels[partial]) return labels[partial];
  }

  return fieldKey;
}

export function classifyErrorType(status, data) {
  if (status === 400) {
    if (data?.errors && Object.keys(data.errors).length > 0) {
      return ERROR_TYPES.VALIDATION;
    }
    return ERROR_TYPES.BUSINESS_ERROR;
  }
  if (status === 404) return ERROR_TYPES.NOT_FOUND;
  if (status === 409) return ERROR_TYPES.CONFLICT;
  if (status === 401) return ERROR_TYPES.UNAUTHORIZED;
  if (status === 403) return ERROR_TYPES.FORBIDDEN;
  if (status >= 500) return ERROR_TYPES.SERVER_ERROR;
  return ERROR_TYPES.BUSINESS_ERROR;
}

export function parseApiError(error, customLabels = {}) {
  const data = error.response?.data;
  const status = error.response?.status || 0;
  const labels = { ...DEFAULT_FIELD_LABELS, ...customLabels };

  const errorType = classifyErrorType(status, data);

  if (data?.errors && Object.keys(data.errors).length > 0) {
    const message = data.detail || 'Campos obrigatórios não preenchidos';
    const fieldErrors = {};
    const descriptionParts = [];

    for (const [campo, msg] of Object.entries(data.errors)) {
      const label = getFieldLabel(campo, labels);
      fieldErrors[campo] = msg;
      descriptionParts.push(`${label}: ${msg}`);
    }

    return {
      message,
      fieldErrors,
      description: descriptionParts.join('\n'),
      errorType,
      status,
    };
  }

  return {
    message: data?.detail || data?.message || error.message || 'Erro desconhecido',
    fieldErrors: null,
    description: null,
    errorType,
    status,
  };
}

export function getApiErrorMessage(error, customLabels) {
  const { message } = parseApiError(error, customLabels);
  return message;
}

export function showApiError(error, customLabels) {
  const { message, fieldErrors, description, errorType } = parseApiError(error, customLabels);

  const icon = ERROR_ICONS[errorType] || ERROR_ICONS[ERROR_TYPES.BUSINESS_ERROR];
  const duration = TOAST_DURATIONS[errorType] || 5000;

  if (fieldErrors) {
    toast.error(message, { description, duration, icon });
  } else {
    toast.error(message, { duration, icon });
  }

  return fieldErrors;
}

export function showApiSuccess(message) {
  toast.success(message);
}