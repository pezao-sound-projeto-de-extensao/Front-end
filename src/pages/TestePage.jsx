import React, { useState } from 'react';
import List from '../components/List';
import { ProductForm } from '../components/ProductForm';

const mockProdutos = [
  {
    id: 1,
    name: 'Cabo P10 Mono 3m',
    category: 'Acessórios elétricos',
    currentStock: 0,
    minStock: 10,
    price: 'R$ 25,00',
    status: 'Zerado'
  },
  {
    id: 2,
    name: 'Microfone Shure SM58',
    category: 'Som automotivo',
    currentStock: 15,
    minStock: 5,
    price: 'R$ 650,00',
    status: 'OK'
  },
  {
    id: 3,
    name: 'Pedal Distortion Boss DS-1',
    category: 'Som automotivo',
    currentStock: 5,
    minStock: 8,
    price: 'R$ 480,00',
    status: 'Baixo'
  },
  {
    id: 4,
    name: 'Corda Violão 0.10',
    category: 'Acessórios elétricos',
    currentStock: 25,
    minStock: 20,
    price: 'R$ 35,00',
    status: 'OK'
  },
  {
    id: 5,
    name: 'LED Strip 5m RGB',
    category: 'Iluminação',
    currentStock: 8,
    minStock: 15,
    price: 'R$ 75,00',
    status: 'Baixo'
  }
];

const columnsConfig = [
  { header: 'PRODUTO', key: 'name' },
  { header: 'CATEGORIA', key: 'category' },
  { header: 'QTD ATUAL', key: 'currentStock' },
  { header: 'QTD MÍNIMA', key: 'minStock' },
  { header: 'PREÇO VENDA', key: 'price' },
  {
    header: 'STATUS',
    render: (row) => {
      const badgeStyles = {
        OK: "bg-green-100 text-green-400",
        Baixo: "bg-orange-100 text-orange-400",
        Zerado: "bg-red-100 text-red-400"
      };
      return (
        <span className={`px-2 py-1 rounded-md text-xs font-bold ${badgeStyles[row.status]}`}>
          {row.status}
        </span>
      );
    }
  }
];

export default function TestPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const getProductRowClass = (row) => {
    switch (row.status) {
      case 'OK':
        return 'border-l-green-300';
      case 'Baixo':
        return 'border-l-orange-300';
      case 'Zerado':
        return 'border-l-red-400';
      default:
        return 'border-l-transparent';
    }
  };

  const totalPages = Math.ceil(mockProdutos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = mockProdutos.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          Painel de Produtos (Teste de Lista Genérica)
        </h1>

        <ProductForm />

        <List
          columns={columnsConfig}
          data={paginatedData}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          rowClassName={getProductRowClass}
        />
      </div>
    </div>
  );
}