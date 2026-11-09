import { lazy } from 'react';
import { LayoutDashboard, Package, ArrowLeftRight, FileText, ShoppingBag, BarChart3, Users } from 'lucide-react';

/**
 * Fonte única das rotas autenticadas: o App gera as <Route> a partir daqui
 * e a Sidebar monta o menu com os mesmos dados (label, ícone, grupo e permissões).
 *
 * permissions: basta ter UMA delas. Lista vazia = qualquer usuário logado.
 * nav: false = rota sem item no menu.
 */
export const NAV_GROUPS = {
  main: 'Navegação',
  estoque: 'Estoque',
  gerenciamento: 'Gerenciamento',
};

export const APP_ROUTES = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    Icon: LayoutDashboard,
    group: 'main',
    permissions: [],
    Component: lazy(() => import('../pages/Dashboard')),
  },
  {
    path: '/products',
    label: 'Produtos',
    Icon: Package,
    group: 'estoque',
    permissions: ['CADASTRAR_ITENS', 'EDITAR_ITENS', 'EXCLUIR_ITENS'],
    Component: lazy(() => import('../pages/Products')),
  },
  {
    path: '/movements',
    label: 'Movimentações',
    Icon: ArrowLeftRight,
    group: 'estoque',
    permissions: ['REGISTRAR_ENTRADA', 'REGISTRAR_SAIDA'],
    Component: lazy(() => import('../pages/Movements')),
  },
  {
    path: '/budgets',
    label: 'Orçamentos',
    Icon: FileText,
    group: 'estoque',
    permissions: ['GERENCIAR_ORCAMENTOS'],
    Component: lazy(() => import('../pages/Budgets')),
  },
  {
    path: '/budgets/:id',
    nav: false,
    permissions: ['GERENCIAR_ORCAMENTOS'],
    Component: lazy(() => import('../pages/BudgetView')),
  },
  {
    path: '/orders',
    label: 'Encomendas',
    Icon: ShoppingBag,
    group: 'estoque',
    permissions: ['GERENCIAR_ENCOMENDAS'],
    Component: lazy(() => import('../pages/Encomendas')),
  },
  {
    path: '/reports',
    label: 'Relatórios',
    Icon: BarChart3,
    group: 'gerenciamento',
    permissions: ['VER_RELATORIOS'],
    Component: lazy(() => import('../pages/Reports')),
  },
  {
    path: '/users',
    label: 'Usuários',
    Icon: Users,
    group: 'gerenciamento',
    permissions: ['GERENCIAR_USUARIOS'],
    Component: lazy(() => import('../pages/Users')),
  },
];

export const NAV_ROUTES = APP_ROUTES.filter((route) => route.nav !== false);

export function canAccess(permissions, hasPermission) {
  return !permissions?.length || permissions.some((p) => hasPermission(p));
}
