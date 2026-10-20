export const ROUTE_PERMISSIONS = {
  '/dashboard': [],
  '/products': ['CADASTRAR_ITENS', 'EDITAR_ITENS', 'EXCLUIR_ITENS'],
  '/movements': ['REGISTRAR_ENTRADA', 'REGISTRAR_SAIDA'],
  '/budgets': ['GERENCIAR_ORCAMENTOS'],
  '/orders': ['GERENCIAR_ENCOMENDAS'],
  '/reports': ['VER_RELATORIOS'],
  '/users': ['GERENCIAR_USUARIOS'],
  '/innovation': [],
};

export function hasRouteAccess(path, hasPermission) {
  const required = ROUTE_PERMISSIONS[path];
  if (!required || required.length === 0) return true;
  return required.some(p => hasPermission(p));
}