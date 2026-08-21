import { useEffect, useState } from 'react';
import { Plus, Minus, FileText, PackagePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { alertaService } from '../services/alertaService';
import { itemService } from '../services/itemService';
import { movimentacaoService } from '../services/movimentacaoService';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import KPICardGrid from '../components/KPICardGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import FormField, { FormInput, FormSelect } from '../components/FormField';
import { showApiError, showApiSuccess } from '../lib/apiError';

export default function Dashboard() {
  const navigate = useNavigate();
  const [productsInAlert, setProductsInAlert] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, okProducts: 0, alertProducts: 0, zeradosProducts: 0 });
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [formData, setFormData] = useState({ productId: '', quantity: '', date: new Date().toISOString().split('T')[0], observation: '' });
  const [errors, setErrors] = useState({ productId: false, quantity: false });

  const carregarDashboard = async () => {
    try {
      setLoading(true);
      const [alertas, itens] = await Promise.all([alertaService.listar(), itemService.listar({ size: 1000 })]);
      const alertasOrdenados = [...alertas].sort((a, b) => a.tipo === 'zerado' && b.tipo !== 'zerado' ? -1 : a.tipo !== 'zerado' && b.tipo === 'zerado' ? 1 : 0);
      setProductsInAlert(alertasOrdenados);
      const itensAtivos = itens.content?.filter(i => i.ativo) || itens.filter(i => i.ativo) || [];
      const total = itensAtivos.length;
      const zerados = itensAtivos.filter(i => i.quantidadeAtual === 0).length;
      const baixos = itensAtivos.filter(i => i.quantidadeAtual > 0 && i.quantidadeAtual < i.quantidadeMinima).length;
      setStats({ totalProducts: total, okProducts: total - zerados - baixos, alertProducts: zerados + baixos, zeradosProducts: zerados });
      setAllProducts(itensAtivos.map(i => ({ id: i.id, name: i.nome, currentStock: i.quantidadeAtual })));
    } catch (error) { console.error('Erro ao carregar dashboard:', error); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregarDashboard(); }, []);

  const handleConfirmEntry = async () => {
    const newErrors = { productId: !formData.productId, quantity: !formData.quantity || parseInt(formData.quantity) <= 0 };
    setErrors(newErrors);
    if (newErrors.productId || newErrors.quantity) return;
    try {
      await movimentacaoService.registrar({ itemId: parseInt(formData.productId), tipo: 'entrada', quantidade: parseInt(formData.quantity), data: formData.date, observacao: formData.observation });
      setShowEntryModal(false);
      setFormData({ productId: '', quantity: '', date: new Date().toISOString().split('T')[0], observation: '' });
      carregarDashboard();
      showApiSuccess('Entrada registrada com sucesso!');
    } catch (error) { showApiError(error); }
  };

  if (loading) return <LoadingSpinner variant="fullpage" message="Carregando dashboard..." />;

  const kpiCards = [
    { label: 'Total de produtos', value: stats.totalProducts, color: '#0d2137', description: 'cadastrados' },
    { label: 'Estoque OK', value: stats.okProducts, color: '#1e9e5e', description: 'produtos normais' },
    { label: 'Em alerta', value: stats.alertProducts, color: '#e07b00', description: 'abaixo do mínimo' },
    { label: 'Zerados', value: stats.zeradosProducts, color: '#e84040', description: 'sem estoque' },
  ];

  const alertColumns = [
    {
      header: 'Foto', accessor: 'imagemUrl', width: '64px',
      render: () => (
        <div className="rounded-lg flex items-center justify-center" style={{ width: '44px', height: '44px', backgroundColor: '#e2eaf3', border: '1.5px dashed #c0d0df' }}>
          <span style={{ fontSize: '11px', color: '#6a92b0' }}>IMG</span>
        </div>
      ),
    },
    { header: 'Produto', accessor: 'nome' },
    { header: 'Qtd atual', accessor: 'quantidadeAtual' },
    { header: 'Qtd mínima', accessor: 'quantidadeMinima' },
    { header: 'Status', accessor: 'tipo', render: (row) => <StatusBadge status={row.tipo} /> },
    {
      header: 'Ação', align: 'right',
      render: (row) => <Button onClick={() => { setFormData({ ...formData, productId: (row.itemId || row.id).toString() }); setShowEntryModal(true); }} variant="secondary" className="px-3 py-1.5 rounded text-xs" style={{ backgroundColor: '#eaf2fb', color: '#1565c0', borderRadius: '5px' }}>Repor</Button>,
    },
  ];

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#e8edf3' }}>
      {productsInAlert.length > 0 && (
        <div className="w-full px-6 py-2.5 flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: '#fff0e0', borderLeft: '4px solid #e07b00' }}>
          <p style={{ fontSize: '13px', color: '#b86200' }}>{productsInAlert.length} produtos estão com estoque abaixo do mínimo</p>
          <Button onClick={() => navigate('/products', { state: { filterByAlert: true } })} variant="secondary" className="px-3 py-1.5 rounded text-xs" style={{ backgroundColor: '#e07b00', color: '#ffffff', borderRadius: '6px' }}>Ver agora</Button>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        <KPICardGrid cards={kpiCards} />

        <div className="mb-6">
          <h2 className="mb-3" style={{ fontSize: '13px', color: '#0d2e52', fontWeight: '500' }}>Produtos que precisam de atenção</h2>
          <DataTable columns={alertColumns} data={productsInAlert} emptyMessage="Nenhum produto em alerta" rowKey="itemId" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button onClick={() => navigate('/movements')} className="px-4 py-3 rounded-lg flex items-center justify-center gap-2" style={{ backgroundColor: '#1565c0', color: '#ffffff', fontSize: '13px', fontWeight: '600', borderRadius: '8px' }}><Plus className="w-4 h-4" /> Registrar entrada</Button>
          <Button onClick={() => navigate('/movements')} variant="outline" className="px-4 py-3 rounded-lg flex items-center justify-center gap-2" style={{ backgroundColor: '#f0f4f8', color: '#1565c0', fontSize: '13px', fontWeight: '600', borderRadius: '8px', border: '1.5px solid #1565c0' }}><Minus className="w-4 h-4" /> Registrar saída</Button>
          <Button onClick={() => navigate('/products')} variant="outline" className="px-4 py-3 rounded-lg flex items-center justify-center gap-2" style={{ backgroundColor: '#f0f4f8', color: '#1a3a55', fontSize: '13px', fontWeight: '600', borderRadius: '8px', border: '1.5px solid #d0dde8' }}><PackagePlus className="w-4 h-4" /> Cadastrar produto</Button>
          <Button onClick={() => navigate('/reports')} variant="outline" className="px-4 py-3 rounded-lg flex items-center justify-center gap-2" style={{ backgroundColor: '#f0f4f8', color: '#1a3a55', fontSize: '13px', fontWeight: '600', borderRadius: '8px', border: '1.5px solid #d0dde8' }}><FileText className="w-4 h-4" /> Ver relatório</Button>
        </div>
      </div>

      {showEntryModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={() => setShowEntryModal(false)}>
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()} style={{ borderRadius: '10px' }}>
            <h2 className="mb-4" style={{ fontSize: '18px', color: '#0d2137', fontWeight: 'bold' }}>Registrar entrada de produto</h2>
            <FormField label="Produto" error={errors.productId}>
              <FormSelect value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value })} error={errors.productId}>
                <option value="">Selecione um produto</option>
                {allProducts.map(p => <option key={p.id} value={p.id}>{p.name} (Estoque: {p.currentStock})</option>)}
              </FormSelect>
            </FormField>
            <FormField label="Quantidade" error={errors.quantity}>
              <FormInput type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} error={errors.quantity} />
            </FormField>
            <FormField label="Data">
              <FormInput type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </FormField>
            <FormField label="Observação">
              <textarea className="w-full p-2 border rounded" style={{ borderColor: '#d0dde8' }} value={formData.observation} onChange={(e) => setFormData({ ...formData, observation: e.target.value })} />
            </FormField>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowEntryModal(false)} className="px-4 py-2 rounded" style={{ backgroundColor: '#f0f4f8', color: '#1a3a55', fontSize: '13px', fontWeight: '600', borderRadius: '8px', border: '1.5px solid #d0dde8' }}>Cancelar</Button>
              <Button onClick={handleConfirmEntry} className="px-4 py-2 rounded" style={{ backgroundColor: '#1565c0', color: '#ffffff', fontSize: '13px', fontWeight: '600', borderRadius: '8px' }}>Confirmar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
