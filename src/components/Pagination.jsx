import { RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="px-4 py-3 flex items-center justify-between border-t" style={{ borderColor: '#d0dde8' }}>
      <p style={{ fontSize: '13px', color: '#5a82a0' }}>
        Página {currentPage + 1} de {totalPages}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0}>
          <RefreshCw className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
