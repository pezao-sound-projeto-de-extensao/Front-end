import { Trash2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from './ui/Button';
import Modal from './ui/Modal';

const VARIANT_STYLES = {
  default: { Icon: CheckCircle, iconClass: 'text-success', bgClass: 'bg-success-soft' },
  destructive: { Icon: Trash2, iconClass: 'text-danger', bgClass: 'bg-danger-soft' },
  warning: { Icon: AlertTriangle, iconClass: 'text-warning-strong', bgClass: 'bg-warning-soft' },
};
const FALLBACK_STYLE = { Icon: XCircle, iconClass: 'text-danger-strong', bgClass: 'bg-danger-soft' };

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  confirmVariant = 'destructive',
  icon,
  loading = false,
}) {
  const { Icon, iconClass, bgClass } = VARIANT_STYLES[confirmVariant] ?? FALLBACK_STYLE;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="mb-4 flex items-start gap-3">
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${bgClass}`}>
          {icon ?? <Icon className={`h-5 w-5 ${iconClass}`} />}
        </div>
        <div>
          <h3 className="mb-2 text-base font-bold text-navy">{title}</h3>
          <p className="text-sm text-ink">{message}</p>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
