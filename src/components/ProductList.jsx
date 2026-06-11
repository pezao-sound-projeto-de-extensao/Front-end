import React from 'react';
import List from './List'; 
import { StatusBadge } from './StatusBadge';

export default function ProductList({ 
  data = [], 
  currentPage, 
  totalPages, 
  onPageChange, 
  onEditProduct, 
  onDeleteProduct 
}) {
  
  const productColumns = [
    { header: 'PRODUTO', key: 'nome' },
    { header: 'QTD ATUAL', key: 'quantidadeAtual' },
    { header: 'QTD MÍNIMA', key: 'quantidadeMinima' },
    { header: 'PREÇO VENDA', key: 'precoVenda' },
    {
      header: 'STATUS',
      render: (row) => {
        let badgeColor = 'outline';
        if (row.quantidadeAtual >= row.quantidadeMinima) badgeColor = 'green';
        else if (row.quantidadeAtual > 0) badgeColor = 'yellow';
        else badgeColor = 'red';

        return <StatusBadge text={row.quantidadeAtual >= row.quantidadeMinima ? 'OK' : row.quantidadeAtual > 0 ? 'Baixo' : 'Zerado'} type={badgeColor} />;
      }
    },
    {
      header: 'AÇÕES',
      render: (row) => (
        <div className="flex gap-3 font-semibold text-sm">
          <button onClick={() => onEditProduct(row.id)} className="text-[#1464c4] hover:underline">Editar</button>
          <button onClick={() => onDeleteProduct(row.id)} className="text-red-500 hover:underline">Excluir</button>
        </div>
      )
    }
  ];

  const getRowClassName = (row) => {
    switch (row.status) {
      case 'OK': return 'border-l-green-400';
      case 'Baixo': return 'border-l-orange-400';
      case 'Zerado': return 'border-l-red-500';
      default: return 'border-l-transparent';
    }
  };

  return (
    <List
      columns={productColumns}
      data={data}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      rowClassName={getRowClassName} 
    />
  );
}