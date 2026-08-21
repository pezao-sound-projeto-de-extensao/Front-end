import { useEffect, useState, useRef } from 'react';
import { Plus, Camera, ZoomIn } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { itemService } from '../services/itemService';
import { categoriaService, unidadeService, imagemProdutoService } from '../services/produtoService';
import PageLayout from '../components/PageLayout';
import SearchBar from '../components/SearchBar';
import FilterSelect from '../components/FilterSelect';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import FormPanel from '../components/FormPanel';
import FormField, { FormInput, FormSelect } from '../components/FormField';
import CrudFormActions from '../components/CrudFormActions';
import ConfirmModal from '../components/ConfirmModal';
import PhotoViewerModal from '../components/PhotoViewerModal';
import useCrudForm from '../hooks/useCrudForm';
import { showApiError, showApiSuccess } from '../lib/apiError';

export default function Products() {
  const location = useLocation();
  const filterByAlert = location.state?.filterByAlert || false;
  const fileInputRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas as categorias');
  const [statusFilter, setStatusFilter] = useState(filterByAlert ? 'Em alerta' : 'Todos os status');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [viewPhoto, setViewPhoto] = useState(null);

  const { showForm, editMode, currentItem, formData, setFormData, errors, saving, handleNew, handleEdit, handleCancel, handleSave, handleClearField } = useCrudForm({
    initialData: { nome: '', categoriaId: '', unidadeId: '', quantidadeAtual: '', quantidadeMinima: '', precoCusto: '', precoVenda: '', photo: '' },
    validate: (data) => ({
      nome: !data.nome.trim(),
      quantidadeAtual: !data.quantidadeAtual.trim() || isNaN(parseInt(data.quantidadeAtual)),
      categoriaId: !data.categoriaId,
      unidadeId: !data.unidadeId,
    }),
    service: itemService,
    loadData: loadProducts,
  });

  async function loadProducts() {
    try {
      setLoading(true);
      const params = { page: currentPage, size: 10, search: searchTerm || undefined };
      if (categoryFilter !== 'Todas as categorias') params.categoriaId = categorias.find(c => c.nome === categoryFilter)?.id;
      const response = await itemService.listar(params);
      let content = response.content || [];
      if (statusFilter === 'Em alerta') {
        content = content.filter(p => { const qtd = p.quantidadeAtual || 0; const min = p.quantidadeMinima || 0; return qtd === 0 || qtd < min; });
      }
      setProducts(content.map(mapProduct));
      setTotalPages(response.totalPages || 1);
    } catch (error) { console.error('Erro ao carregar produtos:', error); }
    finally { setLoading(false); }
  }

  async function loadCategoriasEUnidades() {
    try {
      const [cats, unids] = await Promise.all([categoriaService.listar(), unidadeService.listar()]);
      setCategorias(cats);
      setUnidades(unids);
    } catch (error) { console.error('Erro ao carregar categorias/unidades:', error); }
  }

  useEffect(() => { loadProducts(); loadCategoriasEUnidades(); }, [currentPage, searchTerm, categoryFilter, statusFilter]);
  useEffect(() => { if (filterByAlert) setStatusFilter('Em alerta'); }, [filterByAlert]);

  const mapProduct = (p) => {
    const qtd = p.quantidadeAtual || 0;
    const min = p.quantidadeMinima || 0;
    let status = 'ok';
    if (qtd === 0) status = 'zerado';
    else if (qtd < min) status = 'baixo';
    return {
      id: p.id, name: p.nome, category: p.categoria?.nome || '', categoryId: p.categoria?.id,
      unit: p.unidade ? `${p.unidade.nome} (${p.unidade.abreviacao})` : '', unitId: p.unidade?.id,
      currentStock: qtd, minStock: min,
      costPrice: p.precoCusto ? `R$ ${p.precoCusto.toFixed(2).replace('.', ',')}` : 'R$ 0,00',
      salePrice: p.precoVenda ? `R$ ${p.precoVenda.toFixed(2).replace('.', ',')}` : 'R$ 0,00',
      status, photo: p.imagens?.[0]?.url, ativo: p.ativo,
      precoCustoRaw: p.precoCusto, precoVendaRaw: p.precoVenda,
    };
  };

  const handleEditProduct = (product) => {
    handleEdit(product);
    setFormData({
      nome: product.name, categoriaId: product.categoryId || '', unidadeId: product.unitId || '',
      quantidadeAtual: product.currentStock.toString(), quantidadeMinima: product.minStock.toString(),
      precoCusto: product.precoCustoRaw?.toString() || '', precoVenda: product.precoVendaRaw?.toString() || '', photo: '',
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFormData(prev => ({ ...prev, photo: ev.target?.result }));
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async () => {
    await handleSave((data) => ({
      nome: data.nome.trim(), categoriaId: parseInt(data.categoriaId), unidadeId: parseInt(data.unidadeId),
      quantidadeAtual: parseInt(data.quantidadeAtual) || 0, quantidadeMinima: parseInt(data.quantidadeMinima) || 0,
      precoCusto: parseFloat((data.precoCusto || '0').replace(',', '.')) || 0,
      precoVenda: parseFloat((data.precoVenda || '0').replace(',', '.')) || 0,
    }));
    if (formData.photo && formData.photo.startsWith('data:')) {
      const response = await fetch(formData.photo);
      const blob = await response.blob();
      const file = new File([blob], 'foto.jpg', { type: 'image/jpeg' });
      await imagemProdutoService.upload(currentItem?.id, file, true);
    }
  };

  const confirmDelete = async () => {
    try {
      await itemService.inativar(deleteModal.id);
      await loadProducts();
      showApiSuccess('Produto inativado com sucesso!');
    } catch (err) { showApiError(err); }
    setDeleteModal({ open: false, id: null });
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const columns = [
    {
      header: 'Foto', accessor: 'photo', width: '64px',
      render: (row) => row.photo ? (
        <button type="button" onClick={() => setViewPhoto(row.photo)} className="relative group" style={{ display: 'block' }}>
          <img src={row.photo} alt={row.name} className="rounded-lg object-cover" style={{ width: '44px', height: '44px', border: '1.5px solid #d0dde8' }} />
          <div className="absolute inset-0 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(21,101,192,0.55)' }}>
            <ZoomIn style={{ width: '16px', height: '16px', color: '#fff' }} />
          </div>
        </button>
      ) : (
        <div className="rounded-lg flex items-center justify-center" style={{ width: '44px', height: '44px', backgroundColor: '#e2eaf3', border: '1.5px dashed #c0d0df' }}>
          <Camera style={{ width: '18px', height: '18px', color: '#6a92b0' }} />
        </div>
      ),
    },
    { header: 'Produto', accessor: 'name' },
    { header: 'Categoria', accessor: 'category' },
    { header: 'Qtd atual', accessor: 'currentStock' },
    { header: 'Qtd mínima', accessor: 'minStock' },
    { header: 'Preço venda', accessor: 'salePrice' },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Ações', align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={() => handleEditProduct(row)} style={{ fontSize: '12px', fontWeight: 'bold', color: '#1565c0' }}>Editar</Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteModal({ open: true, id: row.id })} style={{ fontSize: '12px', fontWeight: 'bold', color: '#e84040' }}>Excluir</Button>
        </div>
      ),
    },
  ];

  return (
    <PageLayout title="Cadastro de produtos" actions={<Button onClick={handleNew} className="px-4 py-2.5 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#1565c0', color: '#ffffff', fontSize: '13px', fontWeight: 'bold', borderRadius: '8px' }}><Plus className="w-4 h-4" /> Novo produto</Button>}>
      {showForm && (
        <FormPanel title={editMode ? 'Editar produto' : 'Novo produto'}>
          <FormField label="Nome do produto" error={errors.nome}>
            <FormInput placeholder="Ex: Módulo amplificador 400W" value={formData.nome} onChange={(e) => { setFormData({ ...formData, nome: e.target.value }); handleClearField('nome'); }} error={errors.nome} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Categoria" error={errors.categoriaId}>
              <FormSelect value={formData.categoriaId} onChange={(e) => { setFormData({ ...formData, categoriaId: e.target.value }); handleClearField('categoriaId'); }} error={errors.categoriaId}>
                <option value="">Selecione</option>
                {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
              </FormSelect>
            </FormField>
            <FormField label="Unidade" error={errors.unidadeId}>
              <FormSelect value={formData.unidadeId} onChange={(e) => { setFormData({ ...formData, unidadeId: e.target.value }); handleClearField('unidadeId'); }} error={errors.unidadeId}>
                <option value="">Selecione</option>
                {unidades.map(un => <option key={un.id} value={un.id}>{un.nome} ({un.abreviacao})</option>)}
              </FormSelect>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Quantidade atual" error={errors.quantidadeAtual}>
              <FormInput type="number" min="0" value={formData.quantidadeAtual} onChange={(e) => { setFormData({ ...formData, quantidadeAtual: e.target.value }); handleClearField('quantidadeAtual'); }} error={errors.quantidadeAtual} />
            </FormField>
            <FormField label="Quantidade mínima">
              <FormInput type="number" min="0" value={formData.quantidadeMinima} onChange={(e) => setFormData({ ...formData, quantidadeMinima: e.target.value })} />
              <p style={{ fontSize: '11px', color: '#6a92b0', marginTop: '4px' }}>Abaixo disso, o sistema vai alertar</p>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Preço de custo">
              <FormInput placeholder="0,00" value={formData.precoCusto} onChange={(e) => setFormData({ ...formData, precoCusto: e.target.value })} />
            </FormField>
            <FormField label="Preço de venda">
              <FormInput placeholder="0,00" value={formData.precoVenda} onChange={(e) => setFormData({ ...formData, precoVenda: e.target.value })} />
            </FormField>
          </div>
          <div>
            <label className="block mb-2 uppercase" style={{ fontSize: '12px', color: '#5a82a0' }}>Foto do produto</label>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            {formData.photo ? (
              <div className="flex items-start gap-4">
                <img src={formData.photo} alt="Preview" className="rounded-lg object-cover" style={{ width: '120px', height: '120px', border: '1.5px solid #d0dde8' }} />
                <div className="flex flex-col gap-2 mt-1">
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="px-3 py-2 rounded-lg text-left" style={{ backgroundColor: '#ffffff', border: '1.5px solid #d0dde8', fontSize: '12px', fontWeight: 'bold', color: '#1565c0', borderRadius: '8px' }}>Trocar foto</Button>
                  <Button type="button" variant="outline" onClick={() => setFormData(prev => ({ ...prev, photo: '' }))} className="px-3 py-2 rounded-lg text-left" style={{ backgroundColor: '#ffffff', border: '1.5px solid #fdd', fontSize: '12px', fontWeight: 'bold', color: '#e84040', borderRadius: '8px' }}>Remover foto</Button>
                </div>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-2 w-full rounded-lg" style={{ backgroundColor: '#ffffff', border: '2px dashed #d0dde8', borderRadius: '10px', padding: '28px 14px', cursor: 'pointer' }}>
                <Camera style={{ width: '28px', height: '28px', color: '#5a82a0' }} />
                <span style={{ fontSize: '13px', color: '#5a82a0' }}>Clique para adicionar uma foto</span>
                <span style={{ fontSize: '11px', color: '#b0c8d8' }}>JPG, PNG ou WEBP</span>
              </Button>
            )}
          </div>
          <CrudFormActions editMode={editMode} saving={saving} onCancel={handleCancel} onSave={handleSaveProduct} />
        </FormPanel>
      )}

      <div className="flex gap-3 mb-4">
        <SearchBar value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }} placeholder="Buscar produto pelo nome..." />
        <FilterSelect value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(0); }} width="180px" options={[{ value: 'Todas as categorias', label: 'Todas as categorias' }, ...categorias.map(c => ({ value: c.nome, label: c.nome }))]} />
        <FilterSelect value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }} width="180px" options={[{ value: 'Todos os status', label: 'Todos os status' }, { value: 'Em alerta', label: 'Em alerta' }]} />
      </div>

      <DataTable columns={columns} data={filteredProducts} loading={loading} emptyMessage="Nenhum produto encontrado" />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <PhotoViewerModal src={viewPhoto} onClose={() => setViewPhoto(null)} />
      <ConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })} onConfirm={confirmDelete} title="Excluir produto" message="Tem certeza que deseja inativar este produto? Essa ação pode ser desfeita reativando depois." confirmLabel="Inativar" />
    </PageLayout>
  );
}
