import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Eye, FileText, Pencil, Plus, SearchX, Trash2, XCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { itemService } from '../services/itemService';
import { orcamentoService } from '../services/orcamentoService';
import { clienteService } from '../services/clienteService';
import { formatDate, formatCurrency } from '../lib/formatters';
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
import FormField, { FormInput, FormTextarea, FormPhone } from '../components/FormField';
import CrudFormActions from '../components/CrudFormActions';
import ConfirmModal from '../components/ConfirmModal';
import AutocompleteSelect from '../components/AutocompleteSelect';
import RowActions from '../components/RowActions';

const PAGE_SIZE = 10;
const NEW_CLIENT = 'novo';

const BUDGET_FIELDS = {
  clienteId: 'Cliente',
  'clienteNovo.nome': 'Nome do cliente',
  'clienteNovo.telefone': 'Telefone do cliente',
  observacao: 'Observação',
  'itens.itemId': 'Produto',
  'itens.descricao': 'Descrição do item',
  'itens.quantidade': 'Quantidade',
  'itens.precoUnitario': 'Preço unitário',
};

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'ACEITO', label: 'Aceito' },
  { value: 'REJEITADO', label: 'Rejeitado' },
  { value: 'CONCLUIDO', label: 'Concluído' },
];

const fetchActiveItems = () => itemService.listar({ size: 1000, ativo: true });

const createItem = () => ({ key: crypto.randomUUID(), itemId: '', descricao: '', quantidade: 1, precoUnitario: 0, isNewProduct: false });

const EMPTY_FORM = {
  clienteId: '',
  clienteNovo: { nome: '', telefone: '' },
  observacao: '',
  itens: [createItem()],
};

function validateBudget(data) {
  const errs = {};
  const isNewClient = data.clienteId === NEW_CLIENT;
  if (!isNewClient && !data.clienteId) errs.clienteId = 'Selecione um cliente ou cadastre um novo';
  if (isNewClient && !data.clienteNovo.nome.trim()) errs.clienteNovoNome = 'Nome do cliente é obrigatório';
  if (data.itens.length === 0) errs.itens = 'O orçamento precisa de pelo menos um item';
  data.itens.forEach((item, i) => {
    if (!item.itemId && !item.descricao.trim()) errs[`item${i}Desc`] = 'Selecione um produto ou informe a descrição';
    if (!item.quantidade || item.quantidade < 1) errs[`item${i}Qtd`] = 'Quantidade deve ser maior que zero';
    if (item.precoUnitario == null || item.precoUnitario < 0) errs[`item${i}Preco`] = 'Preço unitário não pode ser negativo';
  });
  return errs;
}

const toFormData = (budget) => ({
  clienteId: String(budget.cliente?.id ?? ''),
  clienteNovo: { nome: '', telefone: '' },
  observacao: budget.observacao ?? '',
  itens: budget.itens.map((item) => ({
    key: crypto.randomUUID(),
    itemId: item.itemId ? String(item.itemId) : '',
    descricao: item.descricao ?? '',
    quantidade: item.quantidade,
    precoUnitario: item.precoUnitario,
    isNewProduct: !item.itemId,
  })),
});

// OrcamentoRequest: clienteId OU clienteNovo; cada item com itemId OU descricao
function toPayload(data) {
  const isNewClient = data.clienteId === NEW_CLIENT;
  return {
    ...(isNewClient
      ? { clienteNovo: { nome: data.clienteNovo.nome.trim(), telefone: data.clienteNovo.telefone.trim() || undefined } }
      : { clienteId: parseInt(data.clienteId, 10) }),
    observacao: data.observacao.trim() || undefined,
    itens: data.itens.map((item) => ({
      ...(item.itemId ? { itemId: parseInt(item.itemId, 10) } : { descricao: item.descricao.trim() }),
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
    })),
  };
}

const budgetTotal = (itens) => itens.reduce((sum, item) => sum + (item.precoUnitario || 0) * (item.quantidade || 0), 0);
const isPending = (budget) => budget.status === 'PENDENTE';

export default function Budgets() {
  const navigate = useNavigate();
  const [clientQuery, setClientQuery] = useState('');
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pendingAction, setPendingAction] = useState(null); // { type: 'aceitar' | 'rejeitar', budget }

  const debouncedSearch = useDebouncedValue(searchTerm);
  const debouncedClientQuery = useDebouncedValue(clientQuery, 300);

  const fetchBudgets = useCallback(() => orcamentoService.listar({
    page: currentPage,
    size: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
  }), [currentPage, debouncedSearch, statusFilter]);

  const fetchClients = useCallback(
    () => clienteService.listar({ search: debouncedClientQuery || undefined, size: 20 }),
    [debouncedClientQuery],
  );

  const { data: page, loading, reload: loadBudgets } = useApiData(fetchBudgets, EMPTY_PAGE);
  const { data: productsPage } = useApiData(fetchActiveItems, EMPTY_PAGE);
  const { data: clientsPage } = useApiData(fetchClients, EMPTY_PAGE);
  const budgets = page.content ?? [];
  const totalPages = page.totalPages || 1;
  const products = productsPage.content ?? [];
  const searchedClients = clientsPage.content ?? [];
  // O cliente do orçamento em edição aparece no campo mesmo fora da busca atual
  const clients = editingClient && !searchedClients.some((c) => c.id === editingClient.id)
    ? [editingClient, ...searchedClients]
    : searchedClients;

  const form = useCrudForm({
    initialData: EMPTY_FORM,
    validate: validateBudget,
    service: orcamentoService,
    loadData: loadBudgets,
    fieldLabels: BUDGET_FIELDS,
    entityName: 'Orçamento',
  });
  const { showForm, editMode, formData, setFormData, errors, saving, clearFieldError } = form;

  const updateForm = (changes) => setFormData((prev) => ({ ...prev, ...changes }));
  const updateItem = (index, changes) => setFormData((prev) => ({
    ...prev,
    itens: prev.itens.map((item, i) => (i === index ? { ...item, ...changes } : item)),
  }));

  const selectClient = (clienteId) => {
    updateForm({ clienteId, clienteNovo: { nome: '', telefone: '' } });
    clearFieldError('clienteId');
  };

  const selectProduct = (index, itemId) => {
    const product = products.find((p) => String(p.id) === itemId);
    updateItem(index, { itemId, descricao: product?.nome ?? '', precoUnitario: product?.precoVenda ?? 0, isNewProduct: false });
    clearFieldError(`item${index}Desc`);
  };

  // Produto fora do catálogo: o back-end aceita só a descrição (OrcamentoItemRequest)
  const startNewProduct = (index, typedText) => {
    updateItem(index, { itemId: '', descricao: typedText?.trim() ?? '', precoUnitario: 0, isNewProduct: true });
    clearFieldError(`item${index}Desc`);
  };

  const addItem = () => setFormData((prev) => ({ ...prev, itens: [...prev.itens, createItem()] }));
  const removeItem = (index) => setFormData((prev) => {
    const itens = prev.itens.filter((_, i) => i !== index);
    return { ...prev, itens: itens.length > 0 ? itens : [createItem()] };
  });

  const confirmPendingAction = async () => {
    const { type, budget } = pendingAction;
    try {
      if (type === 'aceitar') {
        await orcamentoService.aceitar(budget.id);
        showApiSuccess('Orçamento aceito com sucesso! Encomendas geradas.');
      } else {
        await orcamentoService.rejeitar(budget.id);
        showApiSuccess('Orçamento rejeitado com sucesso!');
      }
      await loadBudgets();
    } catch (err) {
      showApiError(err, BUDGET_FIELDS);
    } finally {
      setPendingAction(null);
    }
  };

  const editBudget = (budget) => {
    setEditingClient(budget.cliente ?? null);
    form.handleEdit(budget, toFormData(budget));
  };

  const clientOptions = clients.map((c) => ({ value: String(c.id), label: `${c.nome} - ${c.telefone || 'Sem telefone'}` }));
  const productOptions = products.map((p) => ({ value: String(p.id), label: `${p.nome} - ${formatCurrency(p.precoVenda ?? 0)}` }));

  const columns = [
    {
      header: 'Cliente',
      primary: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-navy">{row.cliente?.nome || '—'}</p>
          <p className="numeric truncate text-xs text-subtle">#{row.id} · {row.cliente?.telefone || 'Sem telefone'}</p>
        </div>
      ),
    },
    { header: 'Data', render: (row) => <span className="numeric">{formatDate(row.criadoEm)}</span> },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Total', numeric: true, bold: true, render: (row) => formatCurrency(row.valorTotal) },
    {
      header: 'Ações', align: 'right', width: '150px',
      render: (row) => (
        <RowActions
          actions={[
            { label: 'Ver', icon: Eye, onClick: () => navigate(`/budgets/${row.id}`) },
            { label: 'Editar', icon: Pencil, onClick: () => editBudget(row), hidden: !isPending(row) },
            { label: 'Aceitar', icon: CheckCircle, tone: 'success', onClick: () => setPendingAction({ type: 'aceitar', budget: row }), hidden: !isPending(row) },
            { label: 'Rejeitar', icon: XCircle, tone: 'danger', onClick: () => setPendingAction({ type: 'rejeitar', budget: row }), hidden: !isPending(row) },
          ]}
        />
      ),
    },
  ];

  const isNewClient = formData.clienteId === NEW_CLIENT;

  return (
    <PageLayout
      title="Orçamentos"
      description="Propostas para clientes. Ao aceitar, as encomendas são geradas automaticamente."
      actions={<Button onClick={() => form.handleNew()}><Plus className="h-4 w-4" /> Novo orçamento</Button>}
    >
      <FormPanel open={showForm} onClose={form.handleCancel} size="lg" title={editMode ? 'Editar orçamento' : 'Novo orçamento'}>
          <FormField label="Cliente" error={errors.clienteId}>
            <AutocompleteSelect
              value={formData.clienteId}
              onChange={selectClient}
              options={clientOptions}
              onInputChange={setClientQuery}
              placeholder="Digite para buscar cliente..."
              newOptionLabel="+ Cadastrar novo cliente"
              onNewOption={(typed) => {
                updateForm({ clienteId: NEW_CLIENT, clienteNovo: { nome: typed?.trim() ?? '', telefone: '' } });
                clearFieldError('clienteId');
              }}
            />
          </FormField>

          {isNewClient && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Nome do cliente" error={errors.clienteNovoNome}>
                <FormInput
                  placeholder="Nome completo"
                  value={formData.clienteNovo.nome}
                  onChange={(e) => { updateForm({ clienteNovo: { ...formData.clienteNovo, nome: e.target.value } }); clearFieldError('clienteNovoNome'); }}
                />
              </FormField>
              <FormField label="Telefone">
                <FormPhone
                  value={formData.clienteNovo.telefone}
                  onChange={(e) => updateForm({ clienteNovo: { ...formData.clienteNovo, telefone: e.target.value } })}
                />
              </FormField>
            </div>
          )}

          <FormField label="Observação (opcional)">
            <FormTextarea
              placeholder="Observações sobre o orçamento (máx. 500 caracteres)"
              value={formData.observacao}
              onChange={(e) => updateForm({ observacao: e.target.value })}
              rows={3}
              maxLength={500}
            />
          </FormField>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="field-label mb-0">Itens do orçamento</span>
              <Button variant="outline-primary" size="sm" onClick={addItem}><Plus className="h-3 w-3" /> Adicionar item</Button>
            </div>
            {errors.itens && <p className="field-error mb-2" role="alert">{errors.itens}</p>}

            <div className="space-y-2">
              {formData.itens.map((item, index) => (
                <div key={item.key} className="flex flex-wrap items-start gap-2 rounded-lg border border-line-strong bg-surface-muted p-3">
                  <div className="min-w-[220px] flex-1 space-y-2">
                    <FormField label="Produto/Serviço" error={item.isNewProduct ? undefined : errors[`item${index}Desc`]}>
                      <AutocompleteSelect
                        value={item.itemId}
                        onChange={(val) => selectProduct(index, val)}
                        options={productOptions}
                        placeholder="Buscar produto ou cadastrar novo..."
                        newOptionLabel="+ Produto fora do catálogo"
                        onNewOption={(typed) => startNewProduct(index, typed)}
                      />
                    </FormField>
                    {item.isNewProduct && (
                      <FormField label="Descrição do novo produto" error={errors[`item${index}Desc`]}>
                        <FormInput
                          placeholder="Ex: Kit de fiação 4mm"
                          value={item.descricao}
                          onChange={(e) => { updateItem(index, { descricao: e.target.value }); clearFieldError(`item${index}Desc`); }}
                        />
                      </FormField>
                    )}
                  </div>
                  <FormField label="Quantidade" error={errors[`item${index}Qtd`]} className="w-[100px]">
                    <FormInput
                      type="number"
                      min="1"
                      value={item.quantidade}
                      onChange={(e) => updateItem(index, { quantidade: parseInt(e.target.value, 10) || 1 })}
                    />
                  </FormField>
                  <FormField label="Preço unit." error={errors[`item${index}Preco`]} className="w-[140px]">
                    <FormInput
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.precoUnitario}
                      onChange={(e) => updateItem(index, { precoUnitario: parseFloat(e.target.value) || 0 })}
                    />
                  </FormField>
                  {formData.itens.length > 1 && (
                    <Button variant="ghost-danger" size="icon" onClick={() => removeItem(index)} className="mt-6" aria-label={`Remover item ${index + 1}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-2 text-right text-base font-bold text-navy">Total: {formatCurrency(budgetTotal(formData.itens))}</p>
          </div>

          <CrudFormActions editMode={editMode} saving={saving} onCancel={form.handleCancel} onSave={() => form.handleSave(toPayload)} />
      </FormPanel>

      <div className="toolbar">
        <SearchBar value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }} placeholder="Buscar por cliente ou número..." />
        <FilterSelect label="Status" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }} options={STATUS_OPTIONS} />
      </div>

      <DataTable
        columns={columns}
        data={budgets}
        loading={loading}
        onRowClick={(row) => navigate(`/budgets/${row.id}`)}
        empty={searchTerm || statusFilter
          ? { icon: SearchX, title: 'Nenhum orçamento encontrado', description: 'Tente outra busca ou ajuste o filtro de status.' }
          : { icon: FileText, title: 'Nenhum orçamento ainda', description: 'Monte o primeiro orçamento com produtos do catálogo ou itens avulsos.', action: <Button onClick={() => form.handleNew()}><Plus className="h-4 w-4" /> Novo orçamento</Button> }}
      />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <ConfirmModal
        isOpen={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        onConfirm={confirmPendingAction}
        title={pendingAction?.type === 'aceitar' ? 'Aceitar orçamento' : 'Rejeitar orçamento'}
        message={pendingAction?.type === 'aceitar'
          ? 'Aceitar este orçamento? Isso gerará encomendas para os itens.'
          : 'Tem certeza que deseja rejeitar este orçamento?'}
        confirmLabel={pendingAction?.type === 'aceitar' ? 'Aceitar' : 'Rejeitar'}
        confirmVariant={pendingAction?.type === 'aceitar' ? 'default' : 'destructive'}
      />
    </PageLayout>
  );
}
