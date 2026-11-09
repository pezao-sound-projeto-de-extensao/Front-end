import { useCallback, useState } from 'react';
import { ArrowLeftRight, Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { itemService } from '../services/itemService';
import { movimentacaoService } from '../services/movimentacaoService';
import { formatDate, todayISO } from '../lib/formatters';
import { showApiError, showApiSuccess } from '../lib/apiError';
import { cn } from '../lib/utils';
import useCrudForm from '../hooks/useCrudForm';
import useDebouncedValue from '../hooks/useDebouncedValue';
import useApiData, { EMPTY_PAGE } from '../hooks/useApiData';
import PageLayout from '../components/PageLayout';
import SearchBar from '../components/SearchBar';
import FilterSelect from '../components/FilterSelect';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import FormPanel from '../components/FormPanel';
import FormField, { FormInput, FormSelect, FormNumber } from '../components/FormField';
import CrudFormActions from '../components/CrudFormActions';
import ConfirmModal from '../components/ConfirmModal';
import RowActions from '../components/RowActions';
import { MovementQuantity, MovementTypeBadge } from '../components/MovementType';
import { isEntrada } from '../lib/movimentacao';

const PAGE_SIZE = 10;

const MOVEMENT_FIELDS = {
  itemId: 'Produto',
  quantidade: 'Quantidade',
  tipo: 'Tipo',
  data: 'Data',
  observacao: 'Observação',
};

const TYPE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'entrada', label: 'Entradas' },
  { value: 'saida', label: 'Saídas' },
];

const fetchActiveItems = () => itemService.listar({ size: 1000, ativo: true });

const createForm = (tipo = 'entrada') => ({ itemId: '', tipo, quantidade: '', data: todayISO(), observacao: '' });
const EMPTY_FORM = createForm();

function validateMovement(data) {
  return {
    itemId: !data.itemId,
    quantidade: !data.quantidade || parseInt(data.quantidade, 10) <= 0,
  };
}

const toFormData = (movement) => ({
  itemId: String(movement.item?.id ?? ''),
  tipo: String(movement.tipo).toLowerCase(),
  quantidade: String(movement.quantidade),
  data: movement.data?.split('T')[0] ?? todayISO(),
  observacao: movement.observacao ?? '',
});

const toPayload = (data) => ({
  itemId: parseInt(data.itemId, 10),
  tipo: data.tipo,
  quantidade: parseInt(data.quantidade, 10),
  data: data.data,
  observacao: data.observacao,
});

/**
 * O back-end não tem PUT para movimentação: a edição apaga a original (revertendo o estoque)
 * e registra a nova. Se o registro falhar, a original é recriada para não perder o lançamento.
 */
async function replaceMovement(original, payload) {
  await movimentacaoService.deletar(original.id);
  try {
    return await movimentacaoService.registrar(payload);
  } catch (error) {
    try {
      await movimentacaoService.registrar(toPayload(toFormData(original)));
    } catch (restoreError) {
      console.error('Não foi possível restaurar a movimentação original:', restoreError);
    }
    throw error;
  }
}

const movementService = {
  criar: movimentacaoService.registrar,
  atualizar: (_id, payload, original) => replaceMovement(original, payload),
};

function TypeToggle({ value, onChange }) {
  const option = (tipo, label, activeClass, idleClass) => (
    <button
      type="button"
      aria-pressed={value === tipo}
      onClick={() => onChange(tipo)}
      className={cn('flex items-center justify-center gap-2 rounded-lg border-[1.5px] py-3 text-sm transition-colors', value === tipo ? activeClass : idleClass)}
    >
      {label}
    </button>
  );

  return (
    <div className="grid grid-cols-2 gap-3" role="group" aria-label="Tipo de movimentação">
      {option('entrada', 'Entrada', 'border-primary bg-primary font-bold text-white', 'border-primary/30 bg-surface text-primary')}
      {option('saida', 'Saída', 'border-danger bg-danger font-bold text-white', 'border-danger/30 bg-surface text-danger-strong')}
    </div>
  );
}

export default function Movements() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebouncedValue(searchTerm);

  const fetchMovements = useCallback(() => movimentacaoService.listar({
    page: currentPage,
    size: PAGE_SIZE,
    tipo: typeFilter || undefined,
    search: debouncedSearch || undefined,
  }), [currentPage, typeFilter, debouncedSearch]);

  const { data: page, loading, reload: loadMovements } = useApiData(fetchMovements, EMPTY_PAGE);
  // O select de produto mostra o estoque atual, então recarrega junto com a lista
  const { data: itensPage, reload: loadItens } = useApiData(fetchActiveItems, EMPTY_PAGE);
  const movements = page.content ?? [];
  const totalPages = page.totalPages || 1;
  const itens = itensPage.content ?? [];

  const reload = useCallback(() => Promise.all([loadMovements(), loadItens()]), [loadMovements, loadItens]);

  const form = useCrudForm({
    initialData: EMPTY_FORM,
    validate: validateMovement,
    service: movementService,
    loadData: reload,
    fieldLabels: MOVEMENT_FIELDS,
    successMessage: (_, isEdit) => (isEdit ? 'Movimentação atualizada com sucesso!' : 'Movimentação registrada com sucesso!'),
  });
  const { showForm, editMode, formData, errors, saving, setField } = form;

  const handleSave = () => form.handleSave(toPayload);

  const confirmDelete = async () => {
    try {
      await movimentacaoService.deletar(deleteTarget.id);
      await reload();
      showApiSuccess('Movimentação excluída com sucesso!');
    } catch (error) {
      showApiError(error, MOVEMENT_FIELDS);
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      header: 'Produto',
      primary: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-navy">{row.item?.nome ?? '—'}</p>
          <p className="truncate text-xs text-subtle">{row.item?.categoriaNome || 'Sem categoria'}</p>
        </div>
      ),
    },
    { header: 'Data', render: (row) => <span className="numeric">{formatDate(row.data)}</span> },
    { header: 'Tipo', render: (row) => <MovementTypeBadge tipo={row.tipo} /> },
    { header: 'Quantidade', numeric: true, render: (row) => <MovementQuantity tipo={row.tipo} quantidade={row.quantidade} /> },
    {
      header: 'Estoque',
      numeric: true,
      render: (row) => (
        <span className="text-body">{row.estoqueAntes} <span aria-hidden="true">→</span><span className="sr-only">para</span> <span className="font-semibold text-navy">{row.estoqueDepois}</span></span>
      ),
    },
    { header: 'Observação', render: (row) => <span className="line-clamp-1 text-body">{row.observacao || '—'}</span> },
    {
      header: 'Ações', align: 'right', width: '120px',
      render: (row) => (
        <RowActions
          actions={[
            { label: 'Editar', icon: Pencil, onClick: () => form.handleEdit(row, toFormData(row)) },
            { label: 'Excluir', icon: Trash2, tone: 'danger', onClick: () => setDeleteTarget(row) },
          ]}
        />
      ),
    },
  ];

  const entrada = isEntrada(formData.tipo);

  return (
    <PageLayout
      title="Movimentações"
      description="Entradas e saídas de estoque, com o saldo antes e depois de cada uma."
      actions={
        <>
          <Button onClick={() => form.handleNew(createForm('entrada'))}><Plus className="h-4 w-4" /> Registrar entrada</Button>
          <Button variant="outline-danger" onClick={() => form.handleNew(createForm('saida'))}><Minus className="h-4 w-4" /> Registrar saída</Button>
        </>
      }
    >
      <FormPanel
        open={showForm}
        onClose={form.handleCancel}
        title={editMode ? 'Editar movimentação' : 'Nova movimentação'}
        badge={<MovementTypeBadge tipo={formData.tipo} />}
      >
          <FormField label="Tipo de movimentação">
            <TypeToggle value={formData.tipo} onChange={(tipo) => setField('tipo', tipo)} />
          </FormField>
          <FormField label="Produto" error={errors.itemId}>
            <FormSelect value={formData.itemId} onChange={(e) => setField('itemId', e.target.value)}>
              <option value="">Selecione um produto</option>
              {itens.map((p) => <option key={p.id} value={p.id}>{p.nome} (Estoque: {p.quantidadeAtual})</option>)}
            </FormSelect>
          </FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Quantidade" error={errors.quantidade}>
              <FormNumber
                value={formData.quantidade}
                onChange={(e) => setField('quantidade', e.target.value)}
                placeholder={entrada ? 'Quantidade a adicionar' : 'Quantidade a retirar'}
              />
            </FormField>
            <FormField label="Data">
              <FormInput type="date" value={formData.data} max={todayISO()} onChange={(e) => setField('data', e.target.value)} />
            </FormField>
          </div>
          <FormField label="Observação">
            <FormInput placeholder="Opcional" value={formData.observacao} onChange={(e) => setField('observacao', e.target.value)} />
          </FormField>
          <CrudFormActions editMode={editMode} saving={saving} onCancel={form.handleCancel} onSave={handleSave} />
      </FormPanel>

      <div className="toolbar">
        <SearchBar value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }} placeholder="Buscar por produto..." />
        <FilterSelect label="Tipo" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(0); }} width="140px" options={TYPE_OPTIONS} />
      </div>

      <DataTable columns={columns} data={movements} loading={loading} empty={{ icon: ArrowLeftRight, title: 'Nenhuma movimentação encontrada', description: searchTerm || typeFilter ? 'Tente outra busca ou ajuste o filtro de tipo.' : 'Registre uma entrada ou saída para ver o histórico aqui.' }} />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Excluir movimentação"
        message="Tem certeza que deseja excluir esta movimentação? O estoque será revertido."
        confirmLabel="Excluir"
      />
    </PageLayout>
  );
}
