import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, FileText, CheckCircle, XCircle, UserPlus, ChevronDown, Search as SearchIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { itemService } from '../services/itemService';
import { orcamentoService } from '../services/orcamentoService';
import { clienteService } from '../services/clienteService';
import PageLayout from '../components/PageLayout';
import SearchBar from '../components/SearchBar';
import FilterSelect from '../components/FilterSelect';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import FormPanel from '../components/FormPanel';
import FormField, { FormInput, FormSelect, FormTextarea } from '../components/FormField';
import CrudFormActions from '../components/CrudFormActions';
import ConfirmModal from '../components/ConfirmModal';
import useCrudForm from '../hooks/useCrudForm';
import { formatDate, formatCurrency } from '../lib/formatters';
import { showApiError, showApiSuccess } from '../lib/apiError';

const initialFormData = {
  clienteId: '',
  clienteNovo: { nome: '', telefone: '' },
  observacao: '',
  itens: [{ itemId: '', descricao: '', quantidade: 1, precoUnitario: 0, isNewProduct: false }],
};

function AutocompleteSelect({
  label,
  value,
  onChange,
  placeholder,
  options,
  onSearch,
  searchValue,
  onSearchChange,
  newOptionLabel,
  onNewOption,
  disabled,
  error,
  required,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    if (selectedOption) {
      setInputValue(selectedOption.label);
    } else if (!isOpen) {
      setInputValue(searchValue);
    }
  }, [selectedOption, searchValue, isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target) &&
          dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    const maxIndex = filteredOptions.length + (newOptionLabel ? 1 : 0) - 1;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => Math.min(prev + 1, maxIndex));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          onChange(filteredOptions[highlightedIndex].value);
          setInputValue(filteredOptions[highlightedIndex].label);
          setIsOpen(false);
          setHighlightedIndex(-1);
        } else if (newOptionLabel && highlightedIndex === filteredOptions.length) {
          onNewOption();
          setInputValue('');
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    onSearchChange(val);
    onSearch(val);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleOptionClick = (optValue) => {
    const opt = options.find(o => o.value === optValue);
    if (opt) {
      setInputValue(opt.label);
    }
    onChange(optValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  return (
    <FormField label={label} error={error}>
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => { onSearch(searchValue); setIsOpen(true); setHighlightedIndex(-1); }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full pl-10 pr-10 py-2.5 rounded-lg border ${
              error ? 'border-red-400' : 'border-gray-300'
            } bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            style={{ fontSize: '14px' }}
            autoComplete="off"
          />
          <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredOptions.length === 0 && !newOptionLabel && (
              <div className="px-4 py-3 text-gray-500 text-sm">Nenhum resultado encontrado</div>
            )}
            {filteredOptions.map((opt, idx) => (
              <div
                key={opt.value}
                onClick={() => handleOptionClick(opt.value)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`px-4 py-2 cursor-pointer text-sm ${highlightedIndex === idx ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
              >
                {opt.label}
              </div>
            ))}
            {newOptionLabel && (
              <div
                onClick={onNewOption}
                onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                className={`px-4 py-2 cursor-pointer text-sm border-t ${highlightedIndex === filteredOptions.length ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                style={{ color: '#1565c0', fontStyle: 'italic' }}
              >
                {newOptionLabel}
              </div>
            )}
          </div>
        )}
      </div>
    </FormField>
  );
}

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [clientSearchDebounce, setClientSearchDebounce] = useState('');
  const [showNewClientFields, setShowNewClientFields] = useState(false);
  const [productSearchDebounce, setProductSearchDebounce] = useState({});
  const [showNewProductFields, setShowNewProductFields] = useState({});
  const clientSearchTimeoutRef = useRef(null);
  const productSearchTimeoutRef = useRef({});
  const [editingBudgetId, setEditingBudgetId] = useState(null);

  const { showForm, editMode, formData, setFormData, errors, handleNew, handleEdit, handleCancel, handleSave, handleClearField } = useCrudForm({
    initialData: initialFormData,
    validate: (data) => {
      const errs = {};
      const isNewClient = data.clienteId === 'novo';
      if (!isNewClient && !data.clienteId) errs.clienteId = 'Selecione um cliente ou cadastre um novo';
      if (isNewClient && !data.clienteNovo?.nome?.trim()) errs.clienteNovoNome = 'Nome do cliente é obrigatório';
      if (!data.itens?.length) errs.itens = 'O orçamento precisa de pelo menos um item';
      data.itens?.forEach((item, i) => {
        if (!item.itemId && !item.descricao?.trim()) errs[`item${i}Desc`] = 'Selecione um produto ou informe a descrição';
        if (!item.quantidade || item.quantidade < 1) errs[`item${i}Qtd`] = 'Quantidade deve ser maior que zero';
        if (item.precoUnitario == null || item.precoUnitario < 0) errs[`item${i}Preco`] = 'Preço unitário não pode ser negativo';
      });
      return errs;
    },
    service: orcamentoService,
    loadData,
  });

  async function loadData() {
    try {
      setLoading(true);
      const itemsPage = await itemService.listar({ size: 1000, ativo: true });
      const items = itemsPage.content || itemsPage;
      setProducts(items.map(i => ({ id: i.id, nome: i.nome, precoVenda: i.precoVenda || 0 })));
      const data = await orcamentoService.listar({ size: 1000 });
      setBudgets(data.content || data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }

  const searchClients = useCallback(async (search) => {
    if (clientSearchTimeoutRef.current) clearTimeout(clientSearchTimeoutRef.current);
    clientSearchTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await clienteService.listar({ search, size: 20 });
        setClients(data.content || data);
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        setClients([]);
      }
    }, 300);
  }, []);

  useEffect(() => {
    loadData();
    return () => {
      if (clientSearchTimeoutRef.current) clearTimeout(clientSearchTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (formData.clienteId === 'existente') {
      searchClients(clientSearchDebounce);
    }
  }, [clientSearchDebounce, formData.clienteId, searchClients]);

  useEffect(() => {
    if (!showForm) {
      setEditingBudgetId(null);
      setShowNewClientFields(false);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [showForm]);

  const handleEditBudget = (budget) => {
    handleEdit(budget);
    setEditingBudgetId(budget.id);
    setShowNewClientFields(false);
    setFormData({
      clienteId: budget.cliente?.id?.toString() || '',
      clienteNovo: { nome: '', telefone: '' },
      observacao: budget.observacao || '',
      itens: budget.itens.map(item => ({
        itemId: item.itemId?.toString() || '',
        descricao: item.descricao || '',
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
        isNewProduct: !item.itemId,
      })),
    });
  };

  const handleClienteSelect = (value) => {
    if (value === 'novo') {
      setShowNewClientFields(true);
      setFormData(prev => ({ ...prev, clienteId: 'novo', clienteNovo: { nome: '', telefone: '' } }));
    } else {
      setShowNewClientFields(false);
      setFormData(prev => ({ ...prev, clienteId: value, clienteNovo: { nome: '', telefone: '' } }));
      handleClearField('clienteId');
    }
  };

  const handleProductSearch = useCallback((index, search) => {
    if (productSearchTimeoutRef.current[index]) clearTimeout(productSearchTimeoutRef.current[index]);
    productSearchTimeoutRef.current[index] = setTimeout(() => {
      setProductSearchDebounce(prev => ({ ...prev, [index]: search }));
    }, 300);
  }, []);

  const clientOptions = clients.map(c => ({
    value: c.id.toString(),
    label: `${c.nome} - ${c.telefone || 'Sem telefone'}`,
  }));

  const addItem = () => setFormData(prev => ({
    ...prev,
    itens: [...prev.itens, { itemId: '', descricao: '', quantidade: 1, precoUnitario: 0, isNewProduct: false }],
  }));

  const removeItem = (index) => setFormData(prev => {
    const newItems = prev.itens.filter((_, i) => i !== index);
    setProductSearchDebounce(prev => { const n = { ...prev }; delete n[index]; return n; });
    setShowNewProductFields(prev => { const n = { ...prev }; delete n[index]; return n; });
    return { ...prev, itens: newItems.length > 0 ? newItems : [{ itemId: '', descricao: '', quantidade: 1, precoUnitario: 0, isNewProduct: false }] };
  });

  const handleProductSelect = (index, itemId) => {
    if (itemId === 'novo') {
      setShowNewProductFields(prev => ({ ...prev, [index]: true }));
      setFormData(prev => ({
        ...prev,
        itens: prev.itens.map((item, i) => i === index ? { ...item, itemId: '', descricao: '', precoUnitario: 0, isNewProduct: true } : item),
      }));
    } else {
      setShowNewProductFields(prev => ({ ...prev, [index]: false }));
      const product = products.find(p => p.id === parseInt(itemId));
      setFormData(prev => ({
        ...prev,
        itens: prev.itens.map((item, i) => i === index ? {
          ...item,
          itemId,
          descricao: product?.nome || '',
          precoUnitario: product?.precoVenda || 0,
          isNewProduct: false,
        } : item),
      }));
      handleClearField(`item${index}Id`);
    }
  };

  const handleSaveBudget = () => {
    handleSave((data) => {
      const isNewClient = data.clienteId === 'novo';
      const payload = {
        ...(!isNewClient && data.clienteId && { clienteId: parseInt(data.clienteId) }),
        ...(isNewClient && {
          clienteNovo: {
            nome: data.clienteNovo.nome.trim(),
            telefone: data.clienteNovo.telefone?.trim() || undefined,
          },
        }),
        observacao: data.observacao?.trim() || undefined,
        itens: data.itens.map(item => ({
          ...(item.itemId && { itemId: parseInt(item.itemId) }),
          ...(!item.itemId && item.descricao?.trim() && { descricao: item.descricao.trim() }),
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
        })),
      };
      return payload;
    });
  };

  const handleAceitar = async (id) => {
    if (!window.confirm('Aceitar este orçamento? Isso gerará encomendas para os itens.')) return;
    try {
      await orcamentoService.aceitar(id);
      showApiSuccess('Orçamento aceito com sucesso! Encomendas geradas.');
      await loadData();
    } catch (err) {
      showApiError(err);
    }
  };

  const handleRejeitar = async (id) => {
    if (!window.confirm('Rejeitar este orçamento?')) return;
    try {
      await orcamentoService.rejeitar(id);
      showApiSuccess('Orçamento rejeitado com sucesso!');
      await loadData();
    } catch (err) {
      showApiError(err);
    }
  };

  const confirmDelete = async () => {
    try {
      await orcamentoService.rejeitar(deleteModal.id);
      await loadData();
      showApiSuccess('Orçamento rejeitado (exclusão não disponível, marcado como rejeitado)!');
    } catch (err) {
      showApiError(err);
    }
    setDeleteModal({ open: false, id: null });
  };

  const isEditable = (status) => status === 'PENDENTE';

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.id?.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'Todos' || budget.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { header: 'Número', accessor: 'id', render: (row) => <span style={{ fontWeight: '500' }}>#{row.id}</span> },
    { header: 'Data', accessor: 'criadoEm', render: (row) => formatDate(row.criadoEm) },
    { header: 'Cliente', accessor: 'cliente.nome' },
    { header: 'Telefone', accessor: 'cliente.telefone' },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Total', accessor: 'valorTotal', align: 'right', render: (row) => <span style={{ fontWeight: 'bold' }}>{formatCurrency(row.valorTotal)}</span> },
    {
      header: 'Ações', align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditBudget(row)}
            disabled={!isEditable(row.status)}
            style={{ fontSize: '12px', fontWeight: 'bold', color: '#1565c0', opacity: isEditable(row.status) ? 1 : 0.5 }}
          >
            Editar
          </Button>
          {row.status === 'PENDENTE' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAceitar(row.id)}
                style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e9e5e' }}
              >
                <CheckCircle className="w-3 h-3 inline-block mr-1" /> Aceitar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRejeitar(row.id)}
                style={{ fontSize: '12px', fontWeight: 'bold', color: '#c0392b' }}
              >
                <XCircle className="w-3 h-3 inline-block mr-1" /> Rejeitar
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const statusOptions = [
    { value: 'Todos', label: 'Todos' },
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'ACEITO', label: 'Aceito' },
    { value: 'REJEITADO', label: 'Rejeitado' },
    { value: 'CONCLUIDO', label: 'Concluído' },
  ];

  const calculateTotal = () => {
    return formData.itens.reduce((sum, item) => sum + (item.precoUnitario || 0) * (item.quantidade || 0), 0);
  };

  return (
    <PageLayout title="Orçamentos" icon={FileText} actions={
      <Button onClick={handleNew} className="px-4 py-2.5 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#1565c0', color: '#ffffff', fontSize: '13px', fontWeight: 'bold', borderRadius: '8px' }}>
        <Plus className="w-4 h-4" /> Novo orçamento
      </Button>
    }>
      {showForm && (
        <FormPanel title={editMode ? 'Editar orçamento' : 'Novo orçamento'}>
          <AutocompleteSelect
            label="Cliente"
            value={formData.clienteId}
            onChange={handleClienteSelect}
            placeholder="Digite para buscar cliente..."
            options={clientOptions}
            searchValue={clientSearchDebounce}
            onSearchChange={setClientSearchDebounce}
            onSearch={searchClients}
            newOptionLabel="+ Cadastrar novo cliente"
            onNewOption={() => handleClienteSelect('novo')}
            error={errors.clienteId}
          />

          {showNewClientFields && (
            <div className="grid grid-cols-2 gap-4 mt-2">
              <FormField label="Nome do cliente" error={errors.clienteNovoNome}>
                <FormInput
                  placeholder="Nome completo"
                  value={formData.clienteNovo?.nome || ''}
                  onChange={(e) => setFormData({ ...formData, clienteNovo: { ...formData.clienteNovo, nome: e.target.value } })}
                  error={errors.clienteNovoNome}
                />
              </FormField>
              <FormField label="Telefone">
                <FormInput
                  placeholder="(11) 99999-8888"
                  value={formData.clienteNovo?.telefone || ''}
                  onChange={(e) => setFormData({ ...formData, clienteNovo: { ...formData.clienteNovo, telefone: e.target.value } })}
                />
              </FormField>
            </div>
          )}

          <FormField label="Observação (opcional)">
            <FormTextarea
              placeholder="Observações sobre o orçamento (máx. 500 caracteres)"
              value={formData.observacao || ''}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              rows={3}
              maxLength={500}
            />
          </FormField>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block mb-2 uppercase" style={{ fontSize: '12px', color: '#5a82a0' }}>Itens do orçamento</label>
              <Button type="button" variant="outline" size="sm" onClick={addItem} style={{ backgroundColor: '#f0f4f8', color: '#1565c0', border: '1.5px solid #1565c0', fontSize: '12px', fontWeight: 'bold', borderRadius: '6px' }}>
                <Plus className="w-3 h-3" /> Adicionar item
              </Button>
            </div>
            <div className="space-y-2">
              {formData.itens.map((item, index) => (
                <div key={index} className="flex gap-2 items-start p-3 border border-gray-300 rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <AutocompleteSelect
                      label="Produto/Serviço"
                      value={item.itemId || (item.isNewProduct ? 'novo' : '')}
                      onChange={(val) => handleProductSelect(index, val)}
                      placeholder="Buscar produto ou cadastrar novo..."
                      options={products.map(p => ({ value: p.id.toString(), label: `${p.nome} - ${formatCurrency(p.precoVenda)}` }))}
                      searchValue={productSearchDebounce[index] || ''}
                      onSearchChange={(val) => setProductSearchDebounce(prev => ({ ...prev, [index]: val }))}
                      onSearch={(val) => handleProductSearch(index, val)}
                      newOptionLabel="+ Cadastrar novo produto"
                      onNewOption={() => handleProductSelect(index, 'novo')}
                      error={errors[`item${index}Desc`] || errors[`item${index}Id`]}
                    />
                  </div>
                  <FormField label="Quantidade" error={errors[`item${index}Qtd`]} style={{ width: '100px', marginBottom: 0 }}>
                    <FormInput
                      type="number"
                      min="1"
                      value={item.quantidade}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        itens: prev.itens.map((it, i) => i === index ? { ...it, quantidade: parseInt(e.target.value) || 1 } : it)
                      }))}
                      error={errors[`item${index}Qtd`]}
                    />
                  </FormField>
                  <FormField label="Preço Unit." error={errors[`item${index}Preco`]} style={{ width: '140px', marginBottom: 0 }}>
                    <FormInput
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.precoUnitario}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        itens: prev.itens.map((it, i) => i === index ? { ...it, precoUnitario: parseFloat(e.target.value) || 0 } : it)
                      }))}
                      error={errors[`item${index}Preco`]}
                      placeholder="0,00"
                    />
                  </FormField>

                  {formData.itens.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} style={{ color: '#e84040', marginTop: '22px' }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="text-right mt-2" style={{ fontSize: '16px', fontWeight: 'bold', color: '#0d2137' }}>
              Total: {formatCurrency(calculateTotal())}
            </div>
          </div>

          <CrudFormActions editMode={editMode} onCancel={handleCancel} onSave={handleSaveBudget} disabled={editMode && editingBudgetId && !isEditable(budgets.find(b => b.id === editingBudgetId)?.status)} />
        </FormPanel>
      )}

      <div className="flex gap-3 mb-4">
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por cliente ou número..." />
        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={statusOptions} />
      </div>

      <DataTable columns={columns} data={filteredBudgets} loading={loading} emptyMessage="Nenhum orçamento encontrado" />

      <ConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })} onConfirm={confirmDelete} title="Rejeitar orçamento" message="Tem certeza que deseja rejeitar este orçamento? (Exclusão não disponível, será marcado como rejeitado)" confirmLabel="Rejeitar" />
    </PageLayout>
  );
}