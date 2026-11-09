import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-4 flex items-center justify-between" aria-label="Paginação">
      <p className="numeric text-sm text-body">
        Página <span className="font-semibold text-navy">{currentPage + 1}</span> de {totalPages}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0}>
          <ChevronLeft className="h-4 w-4" /> Anterior
        </Button>
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1}>
          Próxima <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
