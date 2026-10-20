import { useState, useEffect, useRef } from 'react';
import { LogOut, ChevronDown, Package, ArrowLeftRight, FileText, ShoppingBag, Menu, X, LayoutDashboard, BarChart3, Users, Bot } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/Button';
import { useAuth } from '../context/AuthContext';
import { hasRouteAccess } from '../config/routePermissions';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard, group: 'main' },
  { path: '/products', label: 'Produtos', Icon: Package, group: 'estoque' },
  { path: '/movements', label: 'Movimentações', Icon: ArrowLeftRight, group: 'estoque' },
  { path: '/budgets', label: 'Orçamentos', Icon: FileText, group: 'estoque' },
  { path: '/orders', label: 'Encomendas', Icon: ShoppingBag, group: 'estoque' },
  { path: '/reports', label: 'Relatórios', Icon: BarChart3, group: 'gerenciamento' },
  { path: '/users', label: 'Usuários', Icon: Users, group: 'gerenciamento' },
  { path: '/innovation', label: 'Inovação', Icon: Bot, group: 'gerenciamento' },
];

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();
  const [showEstoque, setShowEstoque] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => navigate('/login');

  const isActive = (path) => location.pathname === path;
  const isEstoqueActive = ['/products', '/movements', '/budgets', '/orders'].includes(location.pathname);

  const hasAccess = (path) => hasRouteAccess(path, hasPermission);

  const visibleItems = NAV_ITEMS.filter(item => hasAccess(item.path));
  const visibleEstoqueItems = visibleItems.filter(item => item.group === 'estoque');
  const visibleMainItems = visibleItems.filter(item => item.group === 'main');
  const visibleGerenciamentoItems = visibleItems.filter(item => item.group === 'gerenciamento');

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowEstoque(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const goTo = (path) => {
    navigate(path);
    setShowMobileMenu(false);
    setShowEstoque(false);
  };

  const navBtn = (path, label) => (
    <button
      onClick={() => navigate(path)}
      className="py-3 px-2 transition-colors hidden md:block"
      style={{
        fontSize: '14px',
        fontWeight: 500,
        color: isActive(path) ? '#2dbae1' : '#a8cce8',
        borderBottom: isActive(path) ? '2px solid #2dbae1' : '2px solid transparent',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );

  const navBtnWithIcon = (path, label, Icon) => (
    <button
      onClick={() => navigate(path)}
      className="flex items-center gap-1.5 py-3 px-2 transition-colors hidden md:block"
      style={{
        fontSize: '14px',
        fontWeight: 500,
        color: isActive(path) ? '#2dbae1' : '#a8cce8',
        borderBottom: isActive(path) ? '2px solid #2dbae1' : '2px solid transparent',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      <Icon style={{ width: '15px', height: '15px', flexShrink: 0 }} />
      {label}
    </button>
  );

  const dropdownItem = ({ path, label, Icon }) => (
    <button
      key={path}
      onClick={() => goTo(path)}
      className="flex items-center gap-3 w-full px-4 py-3 transition-colors"
      style={{
        fontSize: '13px',
        fontWeight: isActive(path) ? 700 : 500,
        color: isActive(path) ? '#2dbae1' : '#a8cce8',
        backgroundColor: isActive(path) ? 'rgba(45,186,225,0.1)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        borderLeft: isActive(path) ? '3px solid #2dbae1' : '3px solid transparent',
      }}
      onMouseEnter={(e) => { if (!isActive(path)) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
      onMouseLeave={(e) => { if (!isActive(path)) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <Icon style={{ width: '15px', height: '15px', flexShrink: 0 }} />
      {label}
    </button>
  );

  const mobileItem = ({ path, label, Icon }) => (
    <button
      key={path}
      onClick={() => goTo(path)}
      className="flex items-center gap-3 w-full px-5 py-3 transition-colors"
      style={{
        fontSize: '14px',
        fontWeight: isActive(path) ? 700 : 500,
        color: isActive(path) ? '#2dbae1' : '#a8cce8',
        backgroundColor: isActive(path) ? 'rgba(45,186,225,0.1)' : 'transparent',
        border: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <Icon style={{ width: '17px', height: '17px', flexShrink: 0 }} />
      {label}
    </button>
  );

  const sectionHeader = (label) => (
    <p className="px-5 pt-4 pb-2" style={{ fontSize: '11px', fontWeight: 700, color: '#6a92b0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {label}
    </p>
  );

  return (
    <header className="w-full relative" style={{ backgroundColor: '#0d2137', zIndex: 40, position: 'sticky', top: 0 }}>
      <div className="px-4 md:px-6 flex items-center justify-between" style={{ height: '56px' }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
            Stock<span style={{ color: '#2dbae1' }}>Flow</span>
          </span>
        </div>

        {/* Nav - Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Main items (Dashboard) */}
          {visibleMainItems.map(({ path, label }) => navBtn(path, label))}

          {/* Dropdown Estoque */}
          {visibleEstoqueItems.length > 0 && (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setShowEstoque(!showEstoque)}
                className="flex items-center gap-1 py-3 px-2 transition-colors"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: isEstoqueActive ? '#2dbae1' : '#a8cce8',
                  borderBottom: isEstoqueActive ? '2px solid #2dbae1' : '2px solid transparent',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Estoque
                <ChevronDown
                  style={{
                    width: '14px',
                    height: '14px',
                    transition: 'transform 0.15s',
                    transform: showEstoque ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {showEstoque && (
                <div
                  className="absolute top-full left-0 mt-1 rounded-lg overflow-hidden"
                  style={{
                    backgroundColor: '#0d2137',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    minWidth: '180px',
                    zIndex: 50,
                  }}
                >
                  {visibleEstoqueItems.map(({ path, label, Icon }) => dropdownItem({ path, label, Icon }))}
                </div>
              )}
            </div>
          )}

          {/* Gerenciamento items */}
          {visibleGerenciamentoItems.map(({ path, label, Icon }) => {
            if (path === '/innovation') return navBtnWithIcon(path, label, Icon);
            if (path === '/users') return navBtn(path, label);
            return navBtn(path, label);
          })}

        </nav>

        {/* Botão Sair - Desktop */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="hidden md:flex items-center gap-2 flex-shrink-0"
          style={{
            fontSize: '13px',
            fontWeight: 700,
            padding: '7px 14px',
            borderRadius: '8px',
          }}
        >
          <LogOut style={{ width: '15px', height: '15px' }} />
          Sair
        </Button>

        {/* Botão Menu - Mobile */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden flex items-center justify-center"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: 'none',
            cursor: 'pointer',
            color: '#ffffff',
          }}
          aria-label="Abrir menu"
        >
          {showMobileMenu ? <X style={{ width: '20px', height: '20px' }} /> : <Menu style={{ width: '20px', height: '20px' }} />}
        </button>
      </div>

      {/* Menu Mobile */}
      {showMobileMenu && (
        <div
          className="md:hidden absolute top-full left-0 w-full overflow-y-auto"
          style={{
            backgroundColor: '#0d2137',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.4)',
            maxHeight: 'calc(100vh - 56px)',
            zIndex: 50,
          }}
        >
          {visibleMainItems.length > 0 && (
            <>
              {sectionHeader('Navegação')}
              {visibleMainItems.map(mobileItem)}
            </>
          )}

          {visibleEstoqueItems.length > 0 && (
            <>
              {sectionHeader('Estoque')}
              {visibleEstoqueItems.map(mobileItem)}
            </>
          )}

          {visibleGerenciamentoItems.length > 0 && (
            <>
              {sectionHeader('Gerenciamento')}
              {visibleGerenciamentoItems.map(mobileItem)}
            </>
          )}

          <div className="p-4">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="flex items-center justify-center gap-2 w-full"
              style={{
                fontSize: '13px',
                fontWeight: 700,
                padding: '10px 14px',
                borderRadius: '8px',
              }}
            >
              <LogOut style={{ width: '15px', height: '15px' }} />
              Sair
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;