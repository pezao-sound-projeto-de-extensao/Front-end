import LoadingSpinner from './LoadingSpinner';

export default function DataTable({ 
  columns, 
  data, 
  emptyMessage = 'Nenhum registro encontrado', 
  loading, 
  rowKey = 'id', 
  onRowClick,
  ativoAccessor,
}) {
  if (loading) {
    return (
      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', boxShadow: 'var(--shadow-card)' }}>
        <LoadingSpinner message="Carregando..." />
      </div>
    );
  }

  const isRowInactive = ativoAccessor ? (row) => row[ativoAccessor] === false : () => false;

  return (
    <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', boxShadow: 'var(--shadow-card)' }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-input)' }}>
              {columns.map((col, i) => (
                <th key={i} className={`${col.align === 'right' ? 'text-right' : 'text-left'} py-3 px-4 uppercase`} style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: '600', width: col.width }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center" style={{ color: 'var(--text-secondary)' }}>{emptyMessage}</td>
              </tr>
            ) : (
              data.map((row) => {
                const inactive = isRowInactive(row);
                return (
                  <tr
                    key={row[rowKey]}
                    className={`hover:bg-[var(--bg-input)] transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${inactive ? 'opacity-50' : ''}`}
                    style={{ 
                      borderTop: '1px solid var(--border-subtle)',
                      textDecoration: inactive ? 'line-through' : 'none',
                    }}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col, i) => (
                      <td key={i} className="py-3 px-4" style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: col.bold ? 'bold' : undefined, textAlign: col.align }}>
                        {col.render ? col.render(row) : row[col.accessor]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
