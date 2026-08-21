import { useState, useEffect, useRef } from 'react';
import { LogOut, ChevronDown, Package, ArrowLeftRight, FileText, ShoppingBag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/Button';

const ESTOQUE_ROUTES = ['/products', '/movements', '/budgets', '/orders'];

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showEstoque, setShowEstoque] = useState(false);
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

  const navBtn = (path, label) => (
    <button
      onClick={() => navigate(path)}
      className="py-3 px-2 transition-colors"
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

  return (
    <header className="w-full relative" style={{ backgroundColor: '#0d2137', zIndex: 40, position: 'sticky', top: 0 }}>
      <div className="px-6 flex items-center justify-between" style={{ height: '56px' }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
            Stock<span style={{ color: '#2dbae1' }}>Flow</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1">
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
                {[
                  { path: '/products', label: 'Produtos', Icon: Package },
                  { path: '/movements', label: 'Movimentações', Icon: ArrowLeftRight },
                  { path: '/budgets', label: 'Orçamentos', Icon: FileText },
                  { path: '/orders', label: 'Encomendas', Icon: ShoppingBag },
                ].map(({ path, label, Icon }) => (
                  <button
                    key={path}
                    onClick={() => { navigate(path); setShowEstoque(false); }}
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

        {/* Botão Sair */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="flex items-center gap-2 flex-shrink-0"
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
      </div>
    </header>
  );
}

export default Navbar;