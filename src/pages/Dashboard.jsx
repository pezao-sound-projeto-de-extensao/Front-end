import { useEffect, useState } from 'react';
import { Plus, Minus, FileText, PackagePlus, LayoutDashboard } from 'lucide-react';
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
import { showApiError, showApiSuccess } from '../lib/apiError.jsx';
import { env } from '../config';

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
      const alertasOrdenados = [...alertas].sort((a, b) => a.tipoAlerta === 'zerado' && b.tipoAlerta !== 'zerado' ? -1 : a.tipoAlerta !== 'zerado' && b.tipoAlerta === 'zerado' ? 1 : 0);
      
      const itensAtivos = itens.content?.filter(i => i.ativo) || itens.filter(i => i.ativo) || [];
      const imageMap = new Map(itensAtivos.map(i => [i.id, i.imagem?.url ? env('VITE_API_BASE_URL') + i.imagem.url : null]));
      
      const enrichedAlerts = alertasOrdenados.map(alerta => ({
        ...alerta,
        imagemUrl: imageMap.get(alerta.itemId) || null,
      }));
      
      setProductsInAlert(enrichedAlerts);
      const total = itensAtivos.length;
      const zerados = itensAtivos.filter(i => i.quantidadeAtual === 0).length;
      const baixos = itensAtivos.filter(i => i.quantidadeAtual > 0 && i.quantidadeAtual < i.quantidadeMinima).length;
      setStats({ totalProducts: total, okProducts: total - zerados - baixos, alertProducts: zerados + baixos, zeradosProducts: zerados });
      setAllProducts(itensAtivos.map(i => ({ id: i.id, name: i.nome, currentStock: i.quantidadeAtual })));
    } catch (error) { console.error('Erro ao carregar dashboard:', error); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregarDashboard(); }, []);

  useEffect(() => { document.title = 'Dashboard · StockFlow'; }, []);

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
      render: (row) => row.imagemUrl ? (
        <img src={row.imagemUrl} alt={row.itemNome} className="rounded-lg object-cover" style={{ width: '44px', height: '44px', border: '1.5px solid var(--border-subtle)' }} />
      ) : (
        <div className="rounded-lg flex items-center justify-center" style={{ width: '44px', height: '44px', backgroundColor: 'var(--bg-input)', border: '1.5px dashed var(--border-subtle)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>IMG</span>
        </div>
      ),
    },
    { header: 'Produto', accessor: 'itemNome' },
    { header: 'Qtd atual', accessor: 'quantidadeAtual' },
    { header: 'Qtd mínima', accessor: 'quantidadeMinima' },
    { header: 'Status', accessor: 'tipoAlerta', render: (row) => <StatusBadge status={row.tipoAlerta} /> },
    {
      header: 'Ação', align: 'right',
      render: (row) => <Button onClick={() => { setFormData({ ...formData, productId: (row.itemId || row.id).toString() }); setShowEntryModal(true); }} variant="secondary" className="px-3 py-1.5 rounded text-xs" style={{ backgroundColor: '#eaf2fb', color: '#1565c0', borderRadius: '5px' }}>Repor</Button>,
    },
  ];

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: 'var(--bg-page)' }}>
      {productsInAlert.length > 0 && (
        <div className="w-full px-6 py-2.5 flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: '#fff8e1', borderLeft: '4px solid #e07b00' }}>
          <p style={{ fontSize: '13px', color: '#b86200', fontWeight: '500' }}>{productsInAlert.length} produtos estão com estoque abaixo do mínimo</p>
          <Button onClick={() => navigate('/products', { state: { filterByAlert: true } })} variant="secondary" className="px-3 py-1.5 rounded text-xs" style={{ backgroundColor: '#e07b00', color: '#ffffff', borderRadius: '6px' }}>Ver agora</Button>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1565c0', color: '#ffffff', boxShadow: '0 2px 6px rgba(21,101,192,0.3)' }}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>Dashboard</h2>
        </div>
        <KPICardGrid cards={kpiCards} />

        <div className="mb-6">
          <h2 className="mb-3" style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600' }}>Produtos que precisam de atenção</h2>
          <DataTable columns={alertColumns} data={productsInAlert} emptyMessage="Nenhum produto em alerta" rowKey="itemId" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button onClick={() => navigate('/movements')} className="px-4 py-3 rounded-lg flex items-center justify-center gap-2" style={{ backgroundColor: '#1565c0', color: '#ffffff', fontSize: '13px', fontWeight: '700', borderRadius: '8px', boxShadow: 'var(--shadow-card)' }}><Plus className="w-4 h-4" /> Registrar entrada</Button>
          <Button onClick={() => navigate('/movements')} variant="outline" className="px-4 py-3 rounded-lg flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--bg-card)', color: '#1565c0', fontSize: '13px', fontWeight: '700', borderRadius: '8px', border: '1.5px solid #1565c0', boxShadow: 'var(--shadow-card)' }}><Minus className="w-4 h-4" /> Registrar saída</Button>
          <Button onClick={() => navigate('/products')} variant="outline" className="px-4 py-3 rounded-lg flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--bg-card)', color: '#1a3a55', fontSize: '13px', fontWeight: '700', borderRadius: '8px', border: '1.5px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}><PackagePlus className="w-4 h-4" /> Cadastrar produto</Button>
          <Button onClick={() => navigate('/reports')} variant="outline" className="px-4 py-3 rounded-lg flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--bg-card)', color: '#1a3a55', fontSize: '13px', fontWeight: '700', borderRadius: '8px', border: '1.5px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}><FileText className="w-4 h-4" /> Ver relatório</Button>
        </div>
      </div>

      {showEntryModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={() => setShowEntryModal(false)}>
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()} style={{ borderRadius: '10px', boxShadow: 'var(--shadow-card-hover)' }}>
            <h2 className="mb-4" style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: '800' }}>Registrar entrada de produto</h2>
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
              <textarea className="w-full p-2 border rounded" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-input)', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: 'var(--text-primary)' }} value={formData.observation} onChange={(e) => setFormData({ ...formData, observation: e.target.value })} />
            </FormField>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowEntryModal(false)} className="px-4 py-2 rounded" style={{ backgroundColor: 'var(--bg-card)', color: '#1a3a55', fontSize: '13px', fontWeight: '700', borderRadius: '8px', border: '1.5px solid var(--border-subtle)' }}>Cancelar</Button>
              <Button onClick={handleConfirmEntry} className="px-4 py-2 rounded" style={{ backgroundColor: '#1565c0', color: '#ffffff', fontSize: '13px', fontWeight: '700', borderRadius: '8px' }}>Confirmar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
