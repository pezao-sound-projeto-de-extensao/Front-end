import LoadingSpinner from './LoadingSpinner';

export default function DataTable({ columns, data, emptyMessage = 'Nenhum registro encontrado', loading, rowKey = 'id', onRowClick }) {
  if (loading) {
    return (
      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#f0f4f8', border: '1px solid #d0dde8', borderRadius: '10px' }}>
        <LoadingSpinner message="Carregando..." />
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#f0f4f8', border: '1px solid #d0dde8', borderRadius: '10px' }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#0d2137' }}>
              {columns.map((col, i) => (
                <th key={i} className={`${col.align === 'right' ? 'text-right' : 'text-left'} py-3 px-4 uppercase`} style={{ fontSize: '11px', color: '#ffffff', fontWeight: '500', width: col.width }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center" style={{ color: '#8aabb8' }}>{emptyMessage}</td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row[rowKey]}
                  className={`hover:bg-[#eaf2fb] transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  style={{ borderTop: '1px solid #d0dde8' }}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col, i) => (
                    <td key={i} className="py-3 px-4" style={{ fontSize: '13px', color: '#1a3a55', fontWeight: col.bold ? 'bold' : undefined, textAlign: col.align }}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
