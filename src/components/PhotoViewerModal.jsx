import { X } from 'lucide-react';
import { Button } from './ui/Button';

export default function PhotoViewerModal({ src, onClose }) {
  if (!src) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.82)' }} onClick={onClose}>
      <div className="relative" onClick={e => e.stopPropagation()}>
        <Button onClick={onClose} variant="ghost" size="icon" className="absolute -top-4 -right-4 w-9 h-9 rounded-full z-10" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
          <X style={{ width: '18px', height: '18px', color: '#1a3a55' }} />
        </Button>
        <img src={src} alt="Foto do produto" className="rounded-xl" style={{ maxWidth: '80vw', maxHeight: '80vh', objectFit: 'contain', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} />
      </div>
    </div>
  );
}
