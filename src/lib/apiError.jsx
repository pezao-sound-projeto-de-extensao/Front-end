import { toast } from 'sonner';
import { AlertTriangle, XCircle, Search, AlertCircle, Ban, Server } from 'lucide-react';

export const ERROR_TYPES = {
  VALIDATION: 'validation',
  BUSINESS_ERROR: 'business_error',
  NOT_FOUND: 'not_found',
  CONFLICT: 'conflict',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  SERVER_ERROR: 'server_error',
};

const TOAST_CONFIG = {
  [ERROR_TYPES.VALIDATION]: { icon: <AlertTriangle className="h-5 w-5 text-amber-500" />, duration: 6000 },
  [ERROR_TYPES.BUSINESS_ERROR]: { icon: <XCircle className="h-5 w-5 text-red-500" />, duration: 5000 },
  [ERROR_TYPES.NOT_FOUND]: { icon: <Search className="h-5 w-5 text-blue-500" />, duration: 4000 },
  [ERROR_TYPES.CONFLICT]: { icon: <AlertCircle className="h-5 w-5 text-orange-500" />, duration: 5000 },
  [ERROR_TYPES.FORBIDDEN]: { icon: <Ban className="h-5 w-5 text-purple-500" />, duration: 4000 },
  [ERROR_TYPES.SERVER_ERROR]: { icon: <Server className="h-5 w-5 text-red-600" />, duration: 6000 },
};

// Rótulos genéricos dos campos que o back-end devolve em `errors`.
// Cada tela pode complementar passando `customLabels`.
const DEFAULT_FIELD_LABELS = {
  nome: 'Nome',
  email: 'E-mail',
  cargo_id: 'Cargo',
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
  clienteId: 'Cliente',
  observacao: 'Observação',
  descricao: 'Descrição',
  precoUnitario: 'Preço unitário',
  abreviacao: 'Abreviação',
  permissoes: 'Permissões',
  quantidade: 'Quantidade',
  tipo: 'Tipo',
  data: 'Data',
  itemId: 'Produto',
};

// "itens[0].quantidade" → "itens.quantidade" (para achar o rótulo)
const normalizeFieldKey = (key) => key.replace(/\[\d+\]/g, '');

function getFieldLabel(fieldKey, labels) {
  const parts = normalizeFieldKey(fieldKey).split('.');
  for (let i = 0; i < parts.length; i++) {
    const candidate = parts.slice(i).join('.');
    if (labels[candidate]) return labels[candidate];
  }
  return fieldKey;
}

export function classifyErrorType(status, data) {
  if (status === 400) {
    return data?.errors && Object.keys(data.errors).length > 0 ? ERROR_TYPES.VALIDATION : ERROR_TYPES.BUSINESS_ERROR;
  }
  if (status === 401) return ERROR_TYPES.UNAUTHORIZED;
  if (status === 403) return ERROR_TYPES.FORBIDDEN;
  if (status === 404) return ERROR_TYPES.NOT_FOUND;
  if (status === 409) return ERROR_TYPES.CONFLICT;
  if (status >= 500) return ERROR_TYPES.SERVER_ERROR;
  return ERROR_TYPES.BUSINESS_ERROR;
}

export function parseApiError(error, customLabels = {}) {
  const data = error?.response?.data;
  const status = error?.response?.status ?? 0;
  const errorType = classifyErrorType(status, data);
  const fieldEntries = Object.entries(data?.errors ?? {});

  if (fieldEntries.length === 0) {
    return {
      message: data?.detail || data?.message || error?.message || 'Erro desconhecido',
      fieldErrors: null,
      description: null,
      errorType,
      status,
    };
  }

  const labels = { ...DEFAULT_FIELD_LABELS, ...customLabels };
  return {
    message: data.detail || 'Campos obrigatórios não preenchidos',
    fieldErrors: Object.fromEntries(fieldEntries),
    description: fieldEntries.map(([field, msg]) => `${getFieldLabel(field, labels)}: ${msg}`).join('\n'),
    errorType,
    status,
  };
}

/**
 * Mostra o toast de erro e devolve os erros por campo (ou null).
 * Cada erro só gera um toast, mesmo que passe pelo interceptor e pela tela.
 */
export function showApiError(error, customLabels) {
  const parsed = parseApiError(error, customLabels);

  if (error && typeof error === 'object') {
    if (error.__toastShown) return parsed.fieldErrors;
    error.__toastShown = true;
  }

  const { icon, duration } = TOAST_CONFIG[parsed.errorType] ?? TOAST_CONFIG[ERROR_TYPES.BUSINESS_ERROR];
  toast.error(parsed.message, { description: parsed.description ?? undefined, duration, icon });
  return parsed.fieldErrors;
}

export function showApiSuccess(message) {
  toast.success(message);
}
