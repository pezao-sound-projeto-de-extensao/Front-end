import React from 'react';

export const List = ({ columns, data, title }) => {
  return (
    <div className="w-full bg-[#f0f4f8] p-4 rounded-lg">
      {title && <h2 className="text-lg font-bold mb-4 text-slate-800">{title}</h2>}
      
      <div className="overflow-x-auto rounded-t-md shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#1a2e44] text-slate-300 uppercase text-xs font-semibold">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="px-4 py-3 border-b border-slate-700">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white">
            {data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-4 py-3 text-sm text-slate-600">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};