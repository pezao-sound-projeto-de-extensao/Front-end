import { Trash2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from './ui/Button';

function getIcon({ confirmVariant, icon }) {
  if (icon) return icon;
  switch (confirmVariant) {
    case 'default':
      return <CheckCircle style={{ width: '20px', height: '20px', color: '#1e9e5e' }} />;
    case 'destructive':
      return <Trash2 style={{ width: '20px', height: '20px', color: '#e84040' }} />;
    case 'warning':
      return <AlertTriangle style={{ width: '20px', height: '20px', color: '#e07b00' }} />;
    default:
      return <XCircle style={{ width: '20px', height: '20px', color: '#c0392b' }} />;
  }
}

function getIconBg({ confirmVariant }) {
  switch (confirmVariant) {
    case 'default':
      return '#e6f7ef';
    case 'destructive':
      return '#fdeaea';
    case 'warning':
      return '#fff4e0';
    default:
      return '#fdeaea';
  }
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirmar', confirmVariant = 'destructive', icon }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={onClose}>
      <div className="p-6 rounded-lg max-w-md w-full mx-4" style={{ backgroundColor: '#ffffff', borderRadius: '10px' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: getIconBg({ confirmVariant }) }}>
            {getIcon({ confirmVariant, icon })}
          </div>
          <div>
            <h3 className="mb-2" style={{ fontSize: '16px', fontWeight: 'bold', color: '#0d2137' }}>{title}</h3>
            <p style={{ fontSize: '14px', color: '#1a3a55' }}>{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="px-4 py-2 rounded-lg" style={{ backgroundColor: '#f0f4f8', color: '#1a3a55', border: '1.5px solid #d0dde8', fontSize: '13px', fontWeight: 'bold', borderRadius: '8px' }}>
            Cancelar
          </Button>
          <Button type="button" variant={confirmVariant} onClick={onConfirm} className="px-4 py-2 rounded-lg" style={{ fontSize: '13px', fontWeight: 'bold', borderRadius: '8px' }}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
