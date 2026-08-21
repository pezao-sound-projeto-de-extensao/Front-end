import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { itemService } from '../services/itemService';
import { pedidoService } from '../services/pedidoService';
import PageLayout from '../components/PageLayout';
import SearchBar from '../components/SearchBar';
import FilterSelect from '../components/FilterSelect';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import FormPanel from '../components/FormPanel';
import FormField, { FormInput, FormSelect } from '../components/FormField';
import CrudFormActions from '../components/CrudFormActions';
import ConfirmModal from '../components/ConfirmModal';
import useCrudForm from '../hooks/useCrudForm';
import { formatDate, formatCurrency } from '../lib/formatters';
import { showApiError, showApiSuccess } from '../lib/apiError';

const initialFormData = {
  supplierName: '',
  supplierContact: '',
  status: 'pendente',
  date: new Date().toISOString().split('T')[0],
  expectedDate: '',
  items: [{ productId: '', quantity: 1 }],
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  const { showForm, editMode, formData, setFormData, errors, handleNew, handleEdit, handleCancel, handleSave, handleClearField } = useCrudForm({
    initialData: initialFormData,
    validate: (data) => ({
      supplierName: !data.supplierName.trim(),
      supplierContact: !data.supplierContact.trim(),
    }),
    service: pedidoService,
    loadData,
  });

  async function loadData() {
    try {
      setLoading(true);
      const itemsPage = await itemService.listar({ size: 1000, ativo: true });
      const items = itemsPage.content || itemsPage;
      setProducts(items.map(i => ({ id: i.id, name: i.nome, costPrice: `R$ ${i.precoCusto?.toFixed(2) || '0,00'}`, price: i.precoCusto || 0 })));
      try {
        const data = await pedidoService.listar({ size: 1000 });
        setOrders(data.content || data);
      } catch { setOrders([]); }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  const handleEditOrder = (order) => {
    handleEdit(order);
    setFormData({
      supplierName: order.supplierName,
      supplierContact: order.supplierContact,
      status: order.status,
      date: order.date,
      expectedDate: order.expectedDate,
      items: order.items.map(item => ({ productId: products.find(p => p.name === item.product)?.id?.toString() || '', quantity: item.quantity })),
    });
  };

  const addItem = () => setFormData(prev => ({ ...prev, items: [...prev.items, { productId: '', quantity: 1 }] }));
  const removeItem = (index) => setFormData(prev => {
    const newItems = prev.items.filter((_, i) => i !== index);
    return { ...prev, items: newItems.length > 0 ? newItems : [{ productId: '', quantity: 1 }] };
  });

  const handleSaveOrder = () => {
    handleSave((data) => ({
      fornecedorNome: data.supplierName,
      fornecedorContato: data.supplierContact,
      status: data.status,
      data: data.date,
      dataPrevisao: data.expectedDate,
      itens: data.items.map(item => ({ itemId: parseInt(item.productId), quantidade: item.quantity })),
    }));
  };

  const confirmDelete = async () => {
    try {
      await pedidoService.deletar(deleteModal.id);
      await loadData();
      showApiSuccess('Pedido excluído com sucesso!');
    } catch (err) { showApiError(err); }
    setDeleteModal({ open: false, id: null });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) || order.number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { header: 'Número', accessor: 'number', render: (row) => <span style={{ fontWeight: '500' }}>{row.number}</span> },
    { header: 'Data', accessor: 'date', render: (row) => formatDate(row.date) },
    { header: 'Fornecedor', accessor: 'supplierName' },
    { header: 'Contato', accessor: 'supplierContact' },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Previsão', accessor: 'expectedDate', render: (row) => formatDate(row.expectedDate) },
    { header: 'Total', accessor: 'total', align: 'right', render: (row) => <span style={{ fontWeight: 'bold' }}>{formatCurrency(row.total)}</span> },
    {
      header: 'Ações', align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={() => handleEditOrder(row)} style={{ fontSize: '12px', fontWeight: 'bold', color: '#1565c0' }}>Editar</Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteModal({ open: true, id: row.id })} style={{ fontSize: '12px', fontWeight: 'bold', color: '#e84040' }}>Excluir</Button>
        </div>
      ),
    },
  ];

  return (
    <PageLayout title="Encomendas / Pedidos de Compra" actions={<Button onClick={handleNew} className="px-4 py-2.5 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#1565c0', color: '#ffffff', fontSize: '13px', fontWeight: 'bold', borderRadius: '8px' }}><Plus className="w-4 h-4" /> Nova encomenda</Button>}>
      {showForm && (
        <FormPanel title={editMode ? 'Editar encomenda' : 'Nova encomenda'}>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Fornecedor" error={errors.supplierName}>
              <FormInput placeholder="Nome do fornecedor" value={formData.supplierName} onChange={(e) => { setFormData({ ...formData, supplierName: e.target.value }); handleClearField('supplierName'); }} error={errors.supplierName} />
            </FormField>
            <FormField label="Contato" error={errors.supplierContact}>
              <FormInput placeholder="(11) 3333-4444" value={formData.supplierContact} onChange={(e) => { setFormData({ ...formData, supplierContact: e.target.value }); handleClearField('supplierContact'); }} error={errors.supplierContact} />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Status">
              <FormSelect value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="pendente">Pendente</option>
                <option value="em_transito">Em trânsito</option>
                <option value="entregue">Entregue</option>
                <option value="cancelado">Cancelado</option>
              </FormSelect>
            </FormField>
            <FormField label="Data do pedido">
              <FormInput type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </FormField>
            <FormField label="Previsão de entrega">
              <FormInput type="date" value={formData.expectedDate} onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })} />
            </FormField>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block mb-2 uppercase" style={{ fontSize: '12px', color: '#5a82a0' }}>Itens do pedido</label>
              <Button type="button" variant="outline" size="sm" onClick={addItem} style={{ backgroundColor: '#f0f4f8', color: '#1565c0', border: '1.5px solid #1565c0', fontSize: '12px', fontWeight: 'bold', borderRadius: '6px' }}>
                <Plus className="w-3 h-3" /> Adicionar item
              </Button>
            </div>
            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <FormSelect value={item.productId} onChange={(e) => setFormData(prev => ({ ...prev, items: prev.items.map((it, i) => i === index ? { ...it, productId: e.target.value } : it) }))}>
                      <option value="">Selecione um produto</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} - {p.costPrice}</option>)}
                    </FormSelect>
                  </div>
                  <div style={{ width: '100px' }}>
                    <FormInput type="number" min="1" value={item.quantity} onChange={(e) => setFormData(prev => ({ ...prev, items: prev.items.map((it, i) => i === index ? { ...it, quantity: parseInt(e.target.value) || 1 } : it) }))} />
                  </div>
                  {formData.items.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} style={{ color: '#e84040' }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="text-right" style={{ fontSize: '14px', fontWeight: 'bold', color: '#0d2137' }}>
              Total: {formatCurrency(formData.items.reduce((sum, item) => { const product = products.find(p => p.id === parseInt(item.productId)); return sum + (product?.price || 0) * item.quantity; }, 0))}
            </div>
          </div>
          <CrudFormActions editMode={editMode} onCancel={handleCancel} onSave={handleSaveOrder} />
        </FormPanel>
      )}

      <div className="flex gap-3 mb-4">
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por fornecedor ou número..." />
        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: 'Todos', label: 'Todos' }, { value: 'pendente', label: 'Pendente' }, { value: 'em_transito', label: 'Em trânsito' }, { value: 'entregue', label: 'Entregue' }, { value: 'cancelado', label: 'Cancelado' }]} />
      </div>

      <DataTable columns={columns} data={filteredOrders} loading={loading} emptyMessage="Nenhum pedido encontrado" />

      <ConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })} onConfirm={confirmDelete} title="Excluir pedido" message="Tem certeza que deseja excluir este pedido?" confirmLabel="Excluir" />
    </PageLayout>
  );
}
