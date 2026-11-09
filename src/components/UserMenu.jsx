import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { ChevronsUpDown, KeyRound, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { initials } from '../lib/formatters';

const itemClass = 'flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-navy outline-none data-[highlighted]:bg-surface-muted';

/** Bloco do usuário no rodapé da sidebar: nome, cargo e menu com senha, tema e sair. */
export default function UserMenu() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent">
          {initials(user?.nome)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-white">{user?.nome}</span>
          <span className="block truncate text-xs text-sidebar-text">{user?.cargo?.nome}</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 flex-shrink-0 text-sidebar-text" aria-hidden="true" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top"
          align="start"
          sideOffset={8}
          className="z-50 w-[var(--radix-dropdown-menu-trigger-width)] min-w-[220px] animate-fade-in rounded-lg border border-line bg-surface p-1 shadow-[var(--shadow-card-hover)]"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-navy">{user?.nome}</p>
            <p className="truncate text-xs text-body">{user?.email}</p>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-line" />
          <DropdownMenu.Item className={itemClass} onSelect={() => navigate('/change-password', { state: { email: user?.email } })}>
            <KeyRound className="h-4 w-4" /> Alterar senha
          </DropdownMenu.Item>
          <DropdownMenu.Item className={itemClass} onSelect={(e) => { e.preventDefault(); toggleTheme(); }}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-line" />
          <DropdownMenu.Item className={`${itemClass} text-danger`} onSelect={handleLogout}>
            <LogOut className="h-4 w-4" /> Sair
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
