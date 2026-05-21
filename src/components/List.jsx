import React from 'react';
import Pagination from './Pagination';

export default function List({
  columns,
  data,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}) {

  const renderTableColumns = () => {
    return columns.map((col, index) => (
      <th key={index} className="px-4 py-3 border-b border-slate-700">
        {col.header}
      </th>
    ))
  }

  const renderRowColumns = (row) => {
    return columns.map((col, colIndex) => (
      <td key={colIndex} className="px-4 py-3 text-sm text-slate-600">
        {col.render ? col.render(row) : row[col.key]}
      </td>
    ))
  }

  const renderBody = () => {
    return data.map((row, rowIndex) => (
      <tr
        key={rowIndex}
        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
      >
        {renderRowColumns(row)}
      </tr>
    ))
  }

  return (
    <div className="w-full bg-[#f0f4f8] p-4 rounded-lg">
      <div className="overflow-x-auto rounded-t-md shadow-sm bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#1a2e44] text-slate-300 uppercase text-xs font-semibold">
            <tr>
              {renderTableColumns()}
            </tr>
          </thead>

          <tbody className="bg-white">
            {data.length !== 0 ? renderBody() : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-slate-400">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )
            }
          </tbody>
        </table>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange}/>
      </div>
    </div>
  );
};