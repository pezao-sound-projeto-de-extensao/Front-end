import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Modal acessível (Radix Dialog): role="dialog", foco preso dentro, fecha com Esc
 * e ao clicar fora, e devolve o foco ao elemento que abriu.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  showCloseButton = true,
  dismissible = true,
}) {
  const handleOpenChange = (next) => {
    if (!next && dismissible) onClose?.();
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2',
            'max-h-[90vh] overflow-y-auto rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-modal)] focus:outline-none',
            className,
          )}
          {...(!description && { 'aria-describedby': undefined })}
          onEscapeKeyDown={(e) => { if (!dismissible) e.preventDefault(); }}
          onPointerDownOutside={(e) => { if (!dismissible) e.preventDefault(); }}
        >
          {title ? (
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <Dialog.Title className="text-base font-bold text-navy">{title}</Dialog.Title>
                {description && <Dialog.Description className="mt-1 text-xs text-subtle">{description}</Dialog.Description>}
              </div>
              {showCloseButton && dismissible && (
                <Dialog.Close className="rounded-lg p-1 text-muted hover:bg-surface-muted" aria-label="Fechar">
                  <X className="h-5 w-5" />
                </Dialog.Close>
              )}
            </div>
          ) : (
            <Dialog.Title className="sr-only">Janela</Dialog.Title>
          )}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
