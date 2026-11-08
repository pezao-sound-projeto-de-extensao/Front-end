import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

const SIZES = { md: 'max-w-lg', lg: 'max-w-2xl' };

/**
 * Formulário de cadastro/edição em painel lateral (desliza da direita).
 * A lista continua visível atrás; fecha com Esc, clique fora ou no X.
 * Coloque o <CrudFormActions> no fim dos children: ele fica fixo no rodapé.
 */
export default function FormPanel({ open, onClose, title, description, badge, size = 'md', children }) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) onClose?.(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 animate-fade-in bg-black/40" />
        <Dialog.Content
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-surface shadow-[var(--shadow-modal)] animate-slide-in-right focus:outline-none',
            SIZES[size],
          )}
          {...(!description && { 'aria-describedby': undefined })}
        >
          <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Dialog.Title className="text-lg font-semibold text-navy">{title}</Dialog.Title>
                {badge}
              </div>
              {description && <Dialog.Description className="mt-1 text-sm text-body">{description}</Dialog.Description>}
            </div>
            <Dialog.Close className="rounded-lg p-1.5 text-muted hover:bg-surface-muted" aria-label="Fechar">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <div className="flex-1 space-y-5 overflow-y-auto px-6 pt-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
