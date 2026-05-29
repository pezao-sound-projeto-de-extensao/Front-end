import React, { useState } from 'react';

export function ProductForm() {
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    unidade: '',
    quantidadeAtual: '',
    quantidadeMinima: '',
    precoCusto: '',
    precoVenda: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dados a serem salvos:', formData);
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg p-6 shadow-sm mb-6">
      <h2 className="text-[#1a2e44] text-lg font-bold mb-6">Novo produto</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          
          {/* Nome do Produto - Ocupa as duas colunas */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-semibold text-[#8ba3b8] uppercase mb-1">
              Nome do Produto
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Ex: Módulo amplificador 400W"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-xs font-semibold text-[#8ba3b8] uppercase mb-1">
              Categoria
            </label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white"
            >
              <option value="Som automotivo">Som automotivo</option>
              <option value="Acessórios elétricos">Acessórios elétricos</option>
              <option value="Iluminação">Iluminação</option>
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-xs font-semibold text-[#8ba3b8] uppercase mb-1">
              Unidade
            </label>
            <select
              name="unidade"
              value={formData.unidade}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white"
            >
              <option value="Unidade (un)">Unidade (un)</option>
              <option value="Caixa (cx)">Caixa (cx)</option>
              <option value="Metros (m)">Metros (m)</option>
            </select>
          </div>
          
          <div className="col-span-1">
            <label className="block text-xs font-semibold text-[#8ba3b8] uppercase mb-1">
              Quantidade Atual
            </label>
            <input
              type="number"
              name="quantidadeAtual"
              value={formData.quantidadeAtual}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <p className="text-xs text-[#8ba3b8] mt-1">Quantas unidades você tem agora?</p>
          </div>

          <div className="col-span-1">
            <label className="block text-xs font-semibold text-[#8ba3b8] uppercase mb-1">
              Quantidade Mínima
            </label>
            <input
              type="number"
              name="quantidadeMinima"
              value={formData.quantidadeMinima}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <p className="text-xs text-[#8ba3b8] mt-1">Abaixo disso, o sistema vai alertar</p>
          </div>

          <div className="col-span-1">
            <label className="block text-xs font-semibold text-[#8ba3b8] uppercase mb-1">
              Preço de Custo
            </label>
            <input
              type="text"
              name="precoCusto"
              value={formData.precoCusto}
              onChange={handleChange}
              placeholder="R$ 0,00"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-xs font-semibold text-[#8ba3b8] uppercase mb-1">
              Preço de Venda
            </label>
            <input
              type="text"
              name="precoVenda"
              value={formData.precoVenda}
              onChange={handleChange}
              placeholder="R$ 0,00"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            className="px-5 py-2 border border-slate-300 rounded-md text-[#1a2e44] font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-[#1464c4] hover:bg-[#104e9c] text-white rounded-md font-semibold text-sm transition-colors shadow-sm"
          >
            Salvar produto
          </button>
        </div>
      </form>
    </div>
  );
};