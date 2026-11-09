import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

const TONE_CLASS = {
  default: 'text-navy',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

/**
 * Ações de uma linha: a primeira visível vira botão, as demais ficam no menu "⋯".
 * actions: [{ label, icon?, onClick, tone?, hidden? }]
 */
export default function RowActions({ actions, label = 'Mais ações' }) {
  const visible = actions.filter((action) => !action.hidden);
  if (visible.length === 0) return null;

  const [primary, ...rest] = visible;
  const PrimaryIcon = primary.icon;

  return (
    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
      <Button variant={primary.tone === 'danger' ? 'ghost-danger' : 'ghost-primary'} size="sm" onClick={primary.onClick}>
        {PrimaryIcon && <PrimaryIcon className="h-3.5 w-3.5" />}
        {primary.label}
      </Button>

      {rest.length > 0 && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="ghost" size="sm" className="w-8 px-0" aria-label={label}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={4}
              className="z-50 min-w-[180px] animate-fade-in rounded-lg border border-line bg-surface p-1 shadow-[var(--shadow-card-hover)]"
            >
              {rest.map(({ label: itemLabel, icon: Icon, onClick, tone = 'default' }) => (
                <DropdownMenu.Item
                  key={itemLabel}
                  onSelect={onClick}
                  className={cn(
                    'flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm font-medium outline-none data-[highlighted]:bg-surface-muted',
                    TONE_CLASS[tone],
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {itemLabel}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </div>
  );
}
