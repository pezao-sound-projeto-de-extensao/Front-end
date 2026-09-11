import { useEffect, useState } from 'react';
import { Plus, Minus, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { itemService } from '../services/itemService';
import { movimentacaoService } from '../services/movimentacaoService';
import PageLayout from '../components/PageLayout';
import SearchBar from '../components/SearchBar';
import FilterSelect from '../components/FilterSelect';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import FormPanel from '../components/FormPanel';
import FormField, { FormInput, FormSelect } from '../components/FormField';
import CrudFormActions from '../components/CrudFormActions';
import ConfirmModal from '../components/ConfirmModal';
import useCrudForm from '../hooks/useCrudForm';
import { formatDate } from '../lib/formatters';
import { showApiError, showApiSuccess } from '../lib/apiError';

const MOVEMENT_FIELDS = { itemId: 'Produto', quantidade: 'Quantidade' };

const initialFormData = {
  itemId: '',
  tipo: 'entrada',
  quantidade: '',
  data: new Date().toISOString().split('T')[0],
  observacao: '',
};

export default function Movements() {
  const [movements, setMovements] = useState([]);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  const { showForm, editMode, currentItem, formData, setFormData, errors, setErrors, saving, handleNew, handleEdit, handleCancel, handleClearField } = useCrudForm({
    initialData: initialFormData,
    validate: (data) => ({
      itemId: !data.itemId,
      quantidade: !data.quantidade || parseInt(data.quantidade) <= 0,
    }),
    service: { criar: movimentacaoService.registrar, atualizar: async () => {} },
    loadData: loadMovements,
  });

  async function loadMovements() {
    try {
      setLoading(true);
      const params = { page: currentPage, size: 10 };
      if (typeFilter !== 'Todos') params.tipo = typeFilter;
      const response = await movimentacaoService.listar(params);
      let content = Array.isArray(response) ? response : (response.content || []);
      if (searchTerm) content = content.filter(m => m.item?.nome?.toLowerCase().includes(searchTerm.toLowerCase()));
      setMovements(content.map(m => ({
        id: m.id,
        date: m.data ? m.data.split('T')[0] : '',
        productName: m.item?.nome || '',
        category: m.item?.categoriaNome || '',
        tipo: m.tipo,
        quantity: m.quantidade,
        stockBefore: m.estoqueAntes,
        stockAfter: m.estoqueDepois,
        observation: m.observacao || '',
        itemId: m.item?.id,
      })));
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
    } finally { setLoading(false); }
  }

  async function loadItens() {
    try {
      const response = await itemService.listar({ size: 1000, ativo: true });
      setItens(response.content || []);
    } catch (error) { console.error('Erro ao carregar itens:', error); }
  }

  useEffect(() => { loadMovements(); loadItens(); }, [currentPage, searchTerm, typeFilter]);

  const handleNewMovement = (prefillTipo) => {
    handleNew();
    setFormData({ ...initialFormData, tipo: prefillTipo || 'entrada' });
  };

  const handleEditMovement = (movement) => {
    handleEdit(movement);
    setFormData({
      itemId: movement.itemId?.toString() || '',
      tipo: movement.tipo,
      quantidade: movement.quantity.toString(),
      data: movement.date,
      observacao: movement.observation,
    });
  };

  const handleSaveMovement = async () => {
    const validationErrors = {
      itemId: !formData.itemId,
      quantidade: !formData.quantidade || parseInt(formData.quantidade) <= 0,
    };
    Object.keys(validationErrors).length > 0 && handleClearField(Object.keys(validationErrors)[0]);

    try {
      const payload = {
        itemId: parseInt(formData.itemId),
        tipo: formData.tipo,
        quantidade: parseInt(formData.quantidade),
        data: formData.data,
        observacao: formData.observacao,
      };
      if (editMode && currentItem) {
        await movimentacaoService.deletar(currentItem.id);
      }
      await movimentacaoService.registrar(payload);
      await loadMovements();
      handleCancel();
      showApiSuccess(editMode ? 'Movimentação atualizada com sucesso!' : 'Movimentação registrada com sucesso!');
    } catch (error) {
      const fieldErrors = showApiError(error, MOVEMENT_FIELDS);
      if (fieldErrors) setErrors(fieldErrors);
    }
  };

  const confirmDelete = async () => {
    try {
      await movimentacaoService.deletar(deleteModal.id);
      await loadMovements();
      showApiSuccess('Movimentação excluída com sucesso!');
    } catch (error) { showApiError(error); }
    setDeleteModal({ open: false, id: null });
  };

  const columns = [
    { header: 'Data', accessor: 'date', render: (row) => formatDate(row.date) },
    { header: 'Produto', accessor: 'productName' },
    { header: 'Categoria', accessor: 'category' },
    {
      header: 'Tipo', accessor: 'tipo',
      render: (row) => (
        <span className="px-2 py-1 rounded" style={{ backgroundColor: row.tipo === 'entrada' ? '#e3edf7' : '#fdeaea', color: row.tipo === 'entrada' ? '#1565c0' : '#c0392b', fontWeight: 'bold', fontSize: '11px', borderRadius: '5px' }}>
          {row.tipo === 'entrada' ? '+ Entrada' : '− Saída'}
        </span>
      ),
    },
    { header: 'Quantidade', accessor: 'quantity', render: (row) => <span style={{ fontWeight: 'bold', color: row.tipo === 'entrada' ? '#1565c0' : '#c0392b' }}>{row.tipo === 'entrada' ? '+' : '−'}{row.quantity}</span> },
    { header: 'Estoque antes', accessor: 'stockBefore' },
    { header: 'Estoque depois', accessor: 'stockAfter' },
    { header: 'Observação', accessor: 'observation', render: (row) => row.observation || '—' },
    {
      header: 'Ações', align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={() => handleEditMovement(row)} style={{ fontSize: '12px', fontWeight: 'bold', color: '#1565c0' }}>Editar</Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteModal({ open: true, id: row.id })} style={{ fontSize: '12px', fontWeight: 'bold', color: '#e84040' }}>Excluir</Button>
        </div>
      ),
    },
  ];

  return (
    <PageLayout title="Movimentações" icon={ArrowLeftRight} actions={<>
      <Button onClick={() => handleNewMovement('entrada')} className="px-4 py-2.5 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#1565c0', color: '#ffffff', fontSize: '13px', fontWeight: 'bold', borderRadius: '8px' }}><Plus className="w-4 h-4" /> Nova entrada</Button>
      <Button variant="outline" onClick={() => handleNewMovement('saida')} className="px-4 py-2.5 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#f0f4f8', color: '#e84040', fontSize: '13px', fontWeight: 'bold', borderRadius: '8px', border: '1.5px solid #e84040' }}><Minus className="w-4 h-4" /> Nova saída</Button>
    </>}>
      {showForm && (
        <FormPanel
          title={
            <span className="flex items-center gap-2">
              {editMode ? 'Editar movimentação' : 'Nova movimentação'}
              <span className="px-2 py-0.5 rounded flex items-center gap-1" style={{ backgroundColor: formData.tipo === 'entrada' ? '#e3edf7' : '#fdeaea', color: formData.tipo === 'entrada' ? '#1565c0' : '#c0392b', fontSize: '11px', fontWeight: 'bold', borderRadius: '5px' }}>
                {formData.tipo === 'entrada' ? <ArrowDownToLine className="w-3 h-3" /> : <ArrowUpFromLine className="w-3 h-3" />}
                {formData.tipo === 'entrada' ? 'Entrada' : 'Saída'}
              </span>
            </span>
          }
          accentColor={formData.tipo === 'entrada' ? '#1565c0' : '#e84040'}
        >
          <FormField label="Tipo de movimentação">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tipo: 'entrada' })}
                className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm transition-colors"
                style={formData.tipo === 'entrada'
                  ? { backgroundColor: '#1565c0', color: '#ffffff', fontWeight: 'bold', boxShadow: 'inset 0 0 0 1.5px #1565c0' }
                  : { backgroundColor: '#ffffff', color: '#1565c0', fontWeight: '500', border: '1.5px solid #bcd6ee' }}
              >
                <ArrowDownToLine className="w-4 h-4" /> Entrada (estoque +)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tipo: 'saida' })}
                className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm transition-colors"
                style={formData.tipo === 'saida'
                  ? { backgroundColor: '#e84040', color: '#ffffff', fontWeight: 'bold', boxShadow: 'inset 0 0 0 1.5px #e84040' }
                  : { backgroundColor: '#ffffff', color: '#c0392b', fontWeight: '500', border: '1.5px solid #f5c6c6' }}
              >
                <ArrowUpFromLine className="w-4 h-4" /> Saída (estoque −)
              </button>
            </div>
          </FormField>
          <FormField label="Produto" error={errors.itemId}>
            <FormSelect value={formData.itemId} onChange={(e) => { setFormData({ ...formData, itemId: e.target.value }); handleClearField('itemId'); }} error={errors.itemId}>
              <option value="">Selecione um produto</option>
              {itens.map(p => <option key={p.id} value={p.id}>{p.nome} (Estoque: {p.quantidadeAtual})</option>)}
            </FormSelect>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Quantidade" error={errors.quantidade}>
              <FormInput type="number" min="1" value={formData.quantidade} onChange={(e) => { setFormData({ ...formData, quantidade: e.target.value }); handleClearField('quantidade'); }} error={errors.quantidade}
                placeholder={formData.tipo === 'entrada' ? 'Quantidade a adicionar' : 'Quantidade a retirar'} />
            </FormField>
            <FormField label="Data">
              <FormInput type="date" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} />
            </FormField>
          </div>
          <FormField label="Observação">
            <FormInput placeholder="Opcional" value={formData.observacao} onChange={(e) => setFormData({ ...formData, observacao: e.target.value })} />
          </FormField>
          <CrudFormActions editMode={editMode} saving={saving} onCancel={handleCancel} onSave={handleSaveMovement} />
        </FormPanel>
      )}

      <div className="flex gap-3 mb-4">
        <SearchBar value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }} placeholder="Buscar por produto..." />
        <FilterSelect value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(0); }} width="140px" options={[{ value: 'Todos', label: 'Todos' }, { value: 'entrada', label: 'Entradas' }, { value: 'saida', label: 'Saídas' }]} />
      </div>

      <DataTable columns={columns} data={movements} loading={loading} emptyMessage="Nenhuma movimentação encontrada" />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <ConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })} onConfirm={confirmDelete} title="Excluir movimentação" message="Tem certeza que deseja excluir esta movimentação? O estoque será revertido." confirmLabel="Excluir" />
    </PageLayout>
  );
}
