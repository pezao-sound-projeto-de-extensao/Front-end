import { useState, useEffect, useRef } from 'react';
import { LogOut, ChevronDown, Package, ArrowLeftRight, FileText, ShoppingBag, Menu, X, LayoutDashboard, BarChart3, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/Button';

const ESTOQUE_ROUTES = ['/products', '/movements', '/budgets', '/orders'];

const ESTOQUE_ITEMS = [
  { path: '/products', label: 'Produtos', Icon: Package },
  { path: '/movements', label: 'Movimentações', Icon: ArrowLeftRight },
  { path: '/budgets', label: 'Orçamentos', Icon: FileText },
  { path: '/orders', label: 'Encomendas', Icon: ShoppingBag },
];

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showEstoque, setShowEstoque] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => navigate('/login');

  const isActive = (path) => location.pathname === path;
  const isEstoqueActive = ESTOQUE_ROUTES.includes(location.pathname);

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
          {/* Dashboard */}
          {navBtn('/dashboard', 'Dashboard')}

          {/* Dropdown Estoque */}
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
                {ESTOQUE_ITEMS.map(({ path, label, Icon }) => (
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
                ))}
              </div>
            )}
          </div>

          {/* Relatórios */}
          {navBtn('/reports', 'Relatórios')}

          {/* Usuários */}
          {navBtn('/users', 'Usuários')}
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
          <p className="px-5 pt-4 pb-2" style={{ fontSize: '11px', fontWeight: 700, color: '#6a92b0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Navegação
          </p>
          {mobileItem({ path: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard })}

          <p className="px-5 pt-4 pb-2" style={{ fontSize: '11px', fontWeight: 700, color: '#6a92b0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Estoque
          </p>
          {ESTOQUE_ITEMS.map(mobileItem)}

          <p className="px-5 pt-4 pb-2" style={{ fontSize: '11px', fontWeight: 700, color: '#6a92b0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Gerenciamento
          </p>
          {mobileItem({ path: '/reports', label: 'Relatórios', Icon: BarChart3 })}
          {mobileItem({ path: '/users', label: 'Usuários', Icon: Users })}

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
