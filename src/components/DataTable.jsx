import EmptyState from './EmptyState';
import { cn } from '../lib/utils';

const SKELETON_ROWS = 5;

const alignClass = (align) => (align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left');

/**
 * Tabela genérica. No celular vira uma lista de cartões.
 *
 * columns: [{ header, accessor?, render?(row), align?, width?, bold?, numeric?, primary? }]
 *   numeric: alinha à direita com dígitos de largura fixa
 *   primary: no celular, vira o título do cartão (por padrão, a 1ª coluna sem `mobileHidden`)
 *   mobileHidden: não aparece no cartão (ex.: foto)
 * empty: { icon, title, description, action } para a lista vazia
 * isRowInactive(row): marca a linha como inativa
 */
export default function DataTable({
  columns,
  data,
  loading = false,
  rowKey = 'id',
  onRowClick,
  isRowInactive,
  empty,
  emptyMessage,
}) {
  const cell = (col, row) => (col.render ? col.render(row) : row[col.accessor]);
  const colAlign = (col) => alignClass(col.align ?? (col.numeric ? 'right' : 'left'));

  const visibleOnMobile = columns.filter((col) => !col.mobileHidden);
  const titleColumn = visibleOnMobile.find((col) => col.primary) ?? visibleOnMobile[0];
  const actionsColumn = visibleOnMobile.find((col) => col.header === 'Ações' || col.actions);
  const detailColumns = visibleOnMobile.filter((col) => col !== titleColumn && col !== actionsColumn);

  if (!loading && data.length === 0) {
    return (
      <div className="card">
        <EmptyState title={emptyMessage} {...empty} />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden" aria-busy={loading}>
      {/* Desktop: tabela */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead className="sticky top-0 z-[1]">
            <tr className="border-b border-line bg-surface-muted">
              {columns.map((col) => (
                <th
                  key={col.header}
                  scope="col"
                  className={cn('whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted', colAlign(col))}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: SKELETON_ROWS }, (_, i) => (
                <tr key={i} className="border-t border-line first:border-t-0">
                  {columns.map((col) => (
                    <td key={col.header} className="px-4 py-4">
                      <div className={cn('skeleton h-4', col.numeric ? 'ml-auto w-12' : 'w-3/4')} />
                    </td>
                  ))}
                </tr>
              ))
              : data.map((row) => {
                const inactive = isRowInactive?.(row) ?? false;
                return (
                  <tr
                    key={row[rowKey]}
                    className={cn(
                      'border-t border-line transition-colors first:border-t-0 hover:bg-surface-muted/60',
                      onRowClick && 'cursor-pointer',
                      inactive && 'text-subtle opacity-60',
                    )}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.header}
                        className={cn(
                          'px-4 py-3 text-sm text-navy',
                          colAlign(col),
                          col.bold && 'font-semibold',
                          col.numeric && 'numeric',
                        )}
                      >
                        {cell(col, row)}
                      </td>
                    ))}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Celular: cartões */}
      <ul className="divide-y divide-line md:hidden">
        {loading
          ? Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="space-y-2 p-4">
              <div className="skeleton h-5 w-2/3" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-4 w-1/3" />
            </li>
          ))
          : data.map((row) => {
            const inactive = isRowInactive?.(row) ?? false;
            return (
              <li
                key={row[rowKey]}
                className={cn('p-4', inactive && 'opacity-60', onRowClick && 'cursor-pointer')}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0 text-base font-semibold text-navy">{cell(titleColumn, row)}</div>
                  {actionsColumn && <div className="flex-shrink-0">{cell(actionsColumn, row)}</div>}
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  {detailColumns.map((col) => (
                    <div key={col.header} className="min-w-0">
                      <dt className="text-xs text-subtle">{col.header}</dt>
                      <dd className={cn('truncate text-navy', col.numeric && 'numeric')}>{cell(col, row)}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
