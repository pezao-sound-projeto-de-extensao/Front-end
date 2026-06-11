import React from 'react';

export default function Pagination({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange 
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="px-4 py-3 flex items-center justify-between border-t border-slate-100 bg-slate-50">
      <div className="text-xs text-slate-500">
        Página <span className="font-semibold text-slate-700">{currentPage}</span> de{' '}
        <span className="font-semibold text-slate-700">{totalPages}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Página Anterior"
        >
          Previous
        </button>

        <span className="text-xs font-medium text-slate-600 px-2">
          {currentPage}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Próxima Página"
        >
          Next
        </button>
      </div>
    </div>
  );
}