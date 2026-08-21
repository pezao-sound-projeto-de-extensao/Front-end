import { useState, useEffect } from 'react';
import { Printer, FileDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { relatorioService } from '../services/relatorioService';
import { categoriaService } from '../services/produtoService';
import PageLayout from '../components/PageLayout';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import KPICardGrid from '../components/KPICardGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import FormField, { FormInput, FormSelect } from '../components/FormField';
import { formatDate } from '../lib/formatters';
import { showApiSuccess } from '../lib/apiError';

export default function Reports() {
  const [period, setPeriod] = useState('Este mês');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('Todas');
  const [categories, setCategories] = useState(['Todas']);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ totalItens: 0, itensOk: 0, itensAlerta: 0, itensZerados: 0 });
  const [criticalProducts, setCriticalProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [movements, setMovements] = useState([]);

  const loadCategories = async () => {
    try { const data = await categoriaService.listar(); setCategories(['Todas', ...data.map(c => c.nome)]); }
    catch (err) { console.error('Erro ao carregar categorias:', err); }
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      const params = { dataInicio: startDate, dataFim: endDate, page: 0, size: 500 };
      if (category !== 'Todas') {
        const catList = await categoriaService.listar();
        const cat = catList.find(c => c.nome === category);
        if (cat) params.categoriaId = cat.id;
      }
      const data = await relatorioService.buscar(params);
      setKpis(data.kpis || { totalItens: 0, itensOk: 0, itensAlerta: 0, itensZerados: 0 });
      setCriticalProducts((data.itensCriticos || []).map((item, i) => ({ id: i, name: item.nome, currentStock: item.quantidadeAtual, minStock: item.quantidadeMinima, status: item.status })));
      setPopularProducts((data.maisMovimentados || []).map(item => ({ name: item.nome, movementCount: item.totalMovimentacoes, color: '#1565c0' })));
      setMovements((data.historico?.content || data.historico || []).map((m, i) => ({ id: i, date: m.data, productName: m.itemNome, category: m.categoriaNome, type: m.tipo, quantity: m.quantidade, stockBefore: m.estoqueAntes, stockAfter: m.estoqueDepois, observation: m.observacao })));
    } catch (err) { console.error('Erro ao carregar relatório:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => {
    const today = new Date();
    let start = new Date();
    let end = new Date();
    if (period === 'Hoje') { start = today; end = today; }
    else if (period === 'Esta semana') { start = new Date(today); start.setDate(today.getDate() - 7); }
    else if (period === 'Este mês') { start = new Date(today.getFullYear(), today.getMonth(), 1); }
    if (period !== 'Personalizado') { setStartDate(start.toISOString().split('T')[0]); setEndDate(end.toISOString().split('T')[0]); }
  }, [period]);
  useEffect(() => { if (startDate && endDate) loadReport(); }, [startDate, endDate, category]);

  const zeradosCount = criticalProducts.filter(p => p.status === 'zerado').length;
  const chartData = [{ name: 'Entradas', value: movements.filter(m => m.type === 'entrada').length }, { name: 'Saídas', value: movements.filter(m => m.type === 'saida').length }];
  const COLORS = ['#1565c0', '#e84040'];
  const maxMovements = popularProducts.length > 0 ? Math.max(...popularProducts.map(p => p.movementCount)) : 1;

  const kpiCards = [
    { label: 'Total em estoque', value: kpis.totalItens, color: '#0d2137', description: 'produtos diferentes' },
    { label: 'Produtos OK', value: kpis.itensOk, color: '#1e9e5e', description: 'dentro do mínimo' },
    { label: 'Produtos em alerta', value: kpis.itensAlerta, color: '#f39c12', description: 'abaixo do mínimo' },
    { label: 'Produtos zerados', value: kpis.itensZerados, color: '#e84040', description: 'sem estoque' },
  ];

  const criticalColumns = [
    { header: 'Produto', accessor: 'name' },
    { header: 'QTD', accessor: 'currentStock' },
    { header: 'Mínimo', accessor: 'minStock' },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  const movementColumns = [
    { header: 'Data', accessor: 'date', render: (row) => formatDate(row.date) },
    { header: 'Produto', accessor: 'productName' },
    { header: 'Categoria', accessor: 'category' },
    {
      header: 'Tipo', accessor: 'type',
      render: (row) => (
        <span className="px-2 py-1 rounded" style={{ backgroundColor: row.type === 'entrada' ? '#e6f7ef' : '#fdeaea', color: row.type === 'entrada' ? '#1e9e5e' : '#c0392b', fontWeight: 'bold', fontSize: '11px', borderRadius: '5px' }}>
          {row.type === 'entrada' ? '+ Entrada' : '− Saída'}
        </span>
      ),
    },
    { header: 'Quantidade', accessor: 'quantity', render: (row) => <span style={{ fontWeight: 'bold', color: row.type === 'entrada' ? '#1e9e5e' : '#c0392b' }}>{row.type === 'entrada' ? '+' : '−'}{row.quantity}</span> },
    { header: 'Estoque antes', accessor: 'stockBefore' },
    { header: 'Estoque depois', accessor: 'stockAfter' },
    { header: 'Observação', accessor: 'observation', render: (row) => row.observation || '—' },
  ];

  return (
    <PageLayout title="Relatórios" actions={<>
      <Button variant="outline" onClick={() => window.print()} className="px-5 py-2.5 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#f0f4f8', color: '#1a3a55', fontSize: '13px', fontWeight: 'bold', borderRadius: '8px', border: '1.5px solid #d0dde8' }}><Printer className="w-4 h-4" /> Imprimir</Button>
      <Button variant="outline" onClick={() => showApiSuccess('Exportação PDF iniciada!')} className="px-5 py-2.5 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#f0f4f8', color: '#1a3a55', fontSize: '13px', fontWeight: 'bold', borderRadius: '8px', border: '1.5px solid #d0dde8' }}><FileDown className="w-4 h-4" /> Exportar PDF</Button>
    </>}>
      <div className="p-6 mb-6 rounded-lg" style={{ backgroundColor: '#f0f4f8', border: '1px solid #d0dde8', borderRadius: '10px' }}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <FormField label="Período">
            <FormSelect value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option>Hoje</option><option>Esta semana</option><option>Este mês</option><option>Personalizado</option>
            </FormSelect>
          </FormField>
          <FormField label="De">
            <FormInput type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPeriod('Personalizado'); }} />
          </FormField>
          <FormField label="Até">
            <FormInput type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPeriod('Personalizado'); }} />
          </FormField>
          <FormField label="Categoria">
            <FormSelect value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </FormSelect>
          </FormField>
          <Button onClick={loadReport} className="px-5 py-2.5 rounded-lg" style={{ backgroundColor: '#1565c0', color: '#ffffff', fontSize: '13px', fontWeight: 'bold', borderRadius: '8px' }}>Aplicar</Button>
        </div>
      </div>

      {loading ? <LoadingSpinner message="Carregando relatório..." /> : (
        <>
          <KPICardGrid cards={kpiCards} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#0d2e52' }}>Produtos com estoque crítico</h3>
                <span className="px-2 py-1 rounded" style={{ backgroundColor: '#fdeaea', color: '#c0392b', fontSize: '11px', fontWeight: 'bold', borderRadius: '5px' }}>{zeradosCount} zerados</span>
              </div>
              <DataTable columns={criticalColumns} data={criticalProducts} emptyMessage="Nenhum produto crítico" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#0d2e52' }}>Produtos mais movimentados</h3>
                <span style={{ fontSize: '11px', color: '#6a92b0' }}>este mês</span>
              </div>
              <div className="p-5 rounded-lg" style={{ backgroundColor: '#f0f4f8', border: '1px solid #d0dde8', borderRadius: '10px' }}>
                <div className="space-y-4">
                  {popularProducts.map((product, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ fontSize: '13px', color: '#1a3a55', fontWeight: '500' }}>{product.name}</span>
                        <span style={{ fontSize: '13px', color: '#1a3a55', fontWeight: 'bold' }}>{product.movementCount}</span>
                      </div>
                      <div className="w-full rounded-full overflow-hidden" style={{ backgroundColor: '#d0dde8', height: '8px' }}>
                        <div className="h-full rounded-full transition-all" style={{ backgroundColor: product.color, width: `${(product.movementCount / maxMovements) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="p-5 rounded-lg" style={{ backgroundColor: '#f0f4f8', border: '1px solid #d0dde8', borderRadius: '10px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#0d2e52', marginBottom: '16px' }}>Movimentações por tipo</h3>
              <div style={{ width: '100%', height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'movimentações']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="p-5 rounded-lg" style={{ backgroundColor: '#f0f4f8', border: '1px solid #d0dde8', borderRadius: '10px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#0d2e52', marginBottom: '16px' }}>Movimentações por categoria</h3>
              <div style={{ width: '100%', height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categories.slice(1).map(cat => ({ name: cat, movimentações: movements.filter(m => m.category === cat).length }))}>
                    <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip />
                    <Bar dataKey="movimentações" fill="#1565c0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#0d2e52' }}>Histórico completo de movimentações no período</h3>
            </div>
            <DataTable columns={movementColumns} data={movements} emptyMessage="Nenhuma movimentação no período" />
          </div>
        </>
      )}
    </PageLayout>
  );
}
