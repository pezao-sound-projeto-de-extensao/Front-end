import { useCallback, useState } from 'react';
import { Ban, Package, Pencil, Plus, RotateCcw, SearchX } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { itemService, imagemProdutoService } from '../services/itemService';
import { categoriaService } from '../services/categoriaService';
import { unidadeService } from '../services/unidadeService';
import { toCurrencyMask, unmaskCurrency } from '../lib/masks';
import { formatCurrency } from '../lib/formatters';
import { showApiError, showApiSuccess } from '../lib/apiError';
import useCrudForm from '../hooks/useCrudForm';
import useDebouncedValue from '../hooks/useDebouncedValue';
import useApiData, { EMPTY_PAGE } from '../hooks/useApiData';
import PageLayout from '../components/PageLayout';
import SearchBar from '../components/SearchBar';
import FilterSelect from '../components/FilterSelect';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import FormPanel from '../components/FormPanel';
import FormField, { FormInput, FormSelect, FormCurrency } from '../components/FormField';
import CrudFormActions from '../components/CrudFormActions';
import ConfirmModal from '../components/ConfirmModal';
import PhotoViewerModal from '../components/PhotoViewerModal';
import ProductPhotoField from '../components/ProductPhotoField';
import ProductThumb from '../components/ProductThumb';
import RowActions from '../components/RowActions';

const PAGE_SIZE = 10;

const PRODUCT_FIELDS = {
  nome: 'Nome',
  categoriaId: 'Categoria',
  unidadeId: 'Unidade',
  quantidadeAtual: 'Quantidade atual',
  quantidadeMinima: 'Quantidade mínima',
  precoCusto: 'Preço de custo',
  precoVenda: 'Preço de venda',
};

const EMPTY_FORM = { nome: '', categoriaId: '', unidadeId: '', quantidadeAtual: '', quantidadeMinima: '', precoCusto: '', precoVenda: '' };

const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos os status' },
  { value: 'alerta', label: 'Em alerta' },
];

const ATIVO_OPTIONS = [
  { value: 'true', label: 'Ativos' },
  { value: 'false', label: 'Inativos' },
  { value: 'todos', label: 'Todos' },
];

function validateProduct(data, isEditMode) {
  return {
    nome: !data.nome.trim(),
    categoriaId: !data.categoriaId,
    unidadeId: !data.unidadeId,
    quantidadeAtual: !isEditMode && (String(data.quantidadeAtual).trim() === '' || Number.isNaN(parseInt(data.quantidadeAtual, 10))),
  };
}

const toFormData = (product) => ({
  nome: product.nome,
  categoriaId: String(product.categoriaId ?? ''),
  unidadeId: String(product.unidadeId ?? ''),
  quantidadeAtual: String(product.quantidadeAtual ?? 0),
  quantidadeMinima: String(product.quantidadeMinima ?? 0),
  precoCusto: toCurrencyMask(product.precoCusto),
  precoVenda: toCurrencyMask(product.precoVenda),
});

// O back-end exige quantidadeAtual também na edição (@Valid), mas só a usa no cadastro,
// onde ele mesmo registra a movimentação de entrada inicial.
const toPayload = (data) => ({
  nome: data.nome.trim(),
  categoriaId: parseInt(data.categoriaId, 10),
  unidadeId: parseInt(data.unidadeId, 10),
  quantidadeAtual: parseInt(data.quantidadeAtual, 10) || 0,
  quantidadeMinima: parseInt(data.quantidadeMinima, 10) || 0,
  precoCusto: unmaskCurrency(data.precoCusto),
  precoVenda: unmaskCurrency(data.precoVenda),
});

const hasPhoto = (product) => Boolean(product?.imagem?.url);

export default function Products() {
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(location.state?.filterByAlert ? 'alerta' : 'todos');
  const [ativoFilter, setAtivoFilter] = useState('true');
  const [currentPage, setCurrentPage] = useState(0);
  const [statusModal, setStatusModal] = useState(null); // produto a inativar/reativar
  const [viewPhoto, setViewPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);

  const debouncedSearch = useDebouncedValue(searchTerm);

  const fetchProducts = useCallback(() => itemService.listar({
    page: currentPage,
    size: PAGE_SIZE,
    search: debouncedSearch || undefined,
    categoriaId: categoriaFilter || undefined,
    ativo: ativoFilter === 'todos' ? undefined : ativoFilter,
    apenasAlerta: statusFilter === 'alerta' || undefined,
  }), [currentPage, debouncedSearch, categoriaFilter, ativoFilter, statusFilter]);

  const { data: page, loading, reload: loadProducts } = useApiData(fetchProducts, EMPTY_PAGE);
  const { data: categorias } = useApiData(categoriaService.listar, []);
  const { data: unidades } = useApiData(unidadeService.listar, []);
  const products = page.content ?? [];
  const totalPages = page.totalPages || 1;

  const form = useCrudForm({
    initialData: EMPTY_FORM,
    validate: validateProduct,
    service: itemService,
    loadData: loadProducts,
    fieldLabels: PRODUCT_FIELDS,
    entityName: 'Produto',
  });
  const { showForm, editMode, currentItem, formData, errors, saving, setField } = form;

  const resetPhoto = () => { setPhotoFile(null); setRemovePhoto(false); };

  const handleNew = () => { resetPhoto(); form.handleNew(); };
  const handleEdit = (product) => { resetPhoto(); form.handleEdit(product, toFormData(product)); };
  const handleCancel = () => { resetPhoto(); form.handleCancel(); };

  const handleSave = async () => {
    const saved = await form.handleSave(toPayload);
    if (saved === undefined) return;

    const itemId = saved?.id ?? currentItem?.id;
    try {
      if (photoFile) {
        await imagemProdutoService.upload(itemId, photoFile);
      } else if (removePhoto && hasPhoto(currentItem)) {
        await imagemProdutoService.deletar(itemId);
      } else {
        return;
      }
      await loadProducts();
    } catch (err) {
      showApiError(err);
    } finally {
      resetPhoto();
    }
  };

  const confirmStatusChange = async () => {
    const product = statusModal;
    try {
      if (product.ativo) {
        await itemService.inativar(product.id);
        showApiSuccess('Produto inativado com sucesso!');
      } else {
        await itemService.reativar(product.id);
        showApiSuccess('Produto reativado com sucesso!');
      }
      await loadProducts();
    } catch (err) {
      showApiError(err, PRODUCT_FIELDS);
    } finally {
      setStatusModal(null);
    }
  };

  // Mudar qualquer filtro volta para a primeira página
  const withPageReset = (setter) => (e) => { setter(e.target.value); setCurrentPage(0); };

  const hasFilters = Boolean(searchTerm || categoriaFilter || statusFilter !== 'todos' || ativoFilter !== 'true');

  const columns = [
    {
      header: 'Produto',
      primary: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <ProductThumb
            size={40}
            src={hasPhoto(row) ? imagemProdutoService.url(row.id, 'icon') : null}
            alt={row.nome}
            onZoom={() => setViewPhoto(imagemProdutoService.url(row.id, 'full'))}
          />
          <div className="min-w-0">
            <p className="truncate font-medium text-navy">{row.nome}</p>
            <p className="truncate text-xs text-subtle">{row.categoriaNome || 'Sem categoria'}</p>
          </div>
        </div>
      ),
    },
    { header: 'Qtd atual', accessor: 'quantidadeAtual', numeric: true, bold: true },
    { header: 'Qtd mínima', accessor: 'quantidadeMinima', numeric: true },
    { header: 'Preço de venda', numeric: true, render: (row) => formatCurrency(row.precoVenda) },
    { header: 'Estoque', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Situação', render: (row) => <StatusBadge status={row.ativo ? 'ativo' : 'inativo'} /> },
    {
      header: 'Ações', align: 'right', width: '140px',
      render: (row) => (
        <RowActions
          actions={[
            { label: 'Editar', icon: Pencil, onClick: () => handleEdit(row), hidden: !row.ativo },
            row.ativo
              ? { label: 'Inativar', icon: Ban, tone: 'danger', onClick: () => setStatusModal(row) }
              : { label: 'Reativar', icon: RotateCcw, tone: 'success', onClick: () => setStatusModal(row) },
          ]}
        />
      ),
    },
  ];

  return (
    <PageLayout
      title="Produtos"
      description="Cadastro, preços e níveis de estoque dos produtos."
      actions={<Button onClick={handleNew}><Plus className="h-4 w-4" /> Novo produto</Button>}
    >
      <FormPanel open={showForm} onClose={handleCancel} title={editMode ? 'Editar produto' : 'Novo produto'}>
          <FormField label="Nome do produto" error={errors.nome}>
            <FormInput placeholder="Ex: Módulo amplificador 400W" value={formData.nome} onChange={(e) => setField('nome', e.target.value)} />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Categoria" error={errors.categoriaId}>
              <FormSelect value={formData.categoriaId} onChange={(e) => setField('categoriaId', e.target.value)}>
                <option value="">Selecione</option>
                {categorias.map((cat) => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
              </FormSelect>
            </FormField>
            <FormField label="Unidade" error={errors.unidadeId}>
              <FormSelect value={formData.unidadeId} onChange={(e) => setField('unidadeId', e.target.value)}>
                <option value="">Selecione</option>
                {unidades.map((un) => <option key={un.id} value={un.id}>{un.nome} ({un.abreviacao})</option>)}
              </FormSelect>
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Quantidade atual"
              error={errors.quantidadeAtual}
              hint={editMode ? 'Na edição a quantidade não muda. Use Movimentações para ajustar o estoque.' : undefined}
            >
              <FormInput type="number" min="0" value={formData.quantidadeAtual} disabled={editMode} onChange={(e) => setField('quantidadeAtual', e.target.value)} />
            </FormField>
            <FormField label="Quantidade mínima" hint="Abaixo disso, o sistema vai alertar">
              <FormInput type="number" min="0" value={formData.quantidadeMinima} onChange={(e) => setField('quantidadeMinima', e.target.value)} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Preço de custo">
              <FormCurrency value={formData.precoCusto} onChange={(e) => setField('precoCusto', e.target.value)} />
            </FormField>
            <FormField label="Preço de venda">
              <FormCurrency value={formData.precoVenda} onChange={(e) => setField('precoVenda', e.target.value)} />
            </FormField>
          </div>

          <ProductPhotoField
            file={photoFile}
            existingUrl={editMode && hasPhoto(currentItem) && !removePhoto ? imagemProdutoService.url(currentItem.id, 'icon') : null}
            onFileChange={setPhotoFile}
            onRemoveExisting={() => setRemovePhoto(true)}
          />

          <CrudFormActions editMode={editMode} saving={saving} onCancel={handleCancel} onSave={handleSave} />
      </FormPanel>

      <div className="toolbar">
        <SearchBar value={searchTerm} onChange={withPageReset(setSearchTerm)} placeholder="Buscar produto pelo nome..." />
        <FilterSelect
          label="Categoria"
          value={categoriaFilter}
          onChange={withPageReset(setCategoriaFilter)}
          width="180px"
          options={[{ value: '', label: 'Todas as categorias' }, ...categorias.map((c) => ({ value: String(c.id), label: c.nome }))]}
        />
        <FilterSelect label="Status do estoque" value={statusFilter} onChange={withPageReset(setStatusFilter)} width="180px" options={STATUS_OPTIONS} />
        <FilterSelect label="Situação" value={ativoFilter} onChange={withPageReset(setAtivoFilter)} width="140px" options={ATIVO_OPTIONS} />
      </div>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        empty={hasFilters
          ? { icon: SearchX, title: 'Nenhum produto encontrado', description: 'Tente outra busca ou ajuste os filtros.' }
          : { icon: Package, title: 'Nenhum produto cadastrado', description: 'Cadastre o primeiro produto para começar a controlar o estoque.', action: <Button onClick={handleNew}><Plus className="h-4 w-4" /> Novo produto</Button> }}
        isRowInactive={(row) => !row.ativo}
      />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <PhotoViewerModal src={viewPhoto} onClose={() => setViewPhoto(null)} />
      <ConfirmModal
        isOpen={Boolean(statusModal)}
        onClose={() => setStatusModal(null)}
        onConfirm={confirmStatusChange}
        title={statusModal?.ativo ? 'Inativar produto' : 'Reativar produto'}
        message={statusModal?.ativo
          ? `Inativar "${statusModal?.nome}"? Ele deixa de aparecer nas listas, mas pode ser reativado depois.`
          : `Reativar "${statusModal?.nome}"?`}
        confirmLabel={statusModal?.ativo ? 'Inativar' : 'Reativar'}
        confirmVariant={statusModal?.ativo ? 'destructive' : 'default'}
      />
    </PageLayout>
  );
}
