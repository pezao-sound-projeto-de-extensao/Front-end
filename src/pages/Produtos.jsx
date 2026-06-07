import React, { useState, useEffect } from 'react';
import ProductList from '../components/ProductList';
import { ProductForm } from '../components/ProductForm';
import { api } from '../services/api';

export default function Produtos() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async (page) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/itens?size=10&page=${page}`);
      const payload = response.data;

      if (!payload) {
        throw new Error('Erro ao buscar os produtos da API');
      }

      setProducts(payload);
      setTotalPages(payload.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const handleEdit = (id) => console.log('Editar', id);
  const handleDelete = (id) => console.log('Excluir', id);

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#0f1f2e]">
            Produtos
          </h1>
          
          <button
            onClick={() => setIsFormVisible(true)}
            className={`flex items-center gap-2 px-4 py-2 bg-[#1464c4] hover:bg-[#104e9c] text-white rounded-md font-semibold text-sm transition-all ${
              isFormVisible ? 'ring-2 ring-offset-2 ring-offset-[#f0f4f8] ring-[#1464c4]' : ''
            }`}
          >
            <span className="text-lg leading-none mt-[-2px]">+</span> Novo produto
          </button>
        </div>

        {isFormVisible && (
          <ProductForm onCancel={() => setIsFormVisible(false)} />
        )}

        {isLoading && <p className="text-sm text-slate-500 mb-4 animate-pulse">Carregando estoque...</p>}
        {error && <p className="text-sm text-red-500 mb-4">Ocorreu um erro: {error}</p>}

        {!isLoading && !error && (
          <ProductList 
            data={products} 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)} 
            onEditProduct={handleEdit} 
            onDeleteProduct={handleDelete} 
          />
        )}

      </div>
    </div>
  );
}