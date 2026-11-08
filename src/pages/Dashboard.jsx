import { useState } from 'react';
import { AlertTriangle, ArrowLeftRight, Boxes, FileText, PackageCheck, PackagePlus, PackageX, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { alertaService } from '../services/alertaService';
import { itemService, imagemProdutoService } from '../services/itemService';
import { movimentacaoService } from '../services/movimentacaoService';
import { useAuth } from '../context/AuthContext';
import useApiData from '../hooks/useApiData';
import { showApiError, showApiSuccess } from '../lib/apiError';
import { todayISO } from '../lib/formatters';
import PageLayout from '../components/PageLayout';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import KPICardGrid from '../components/KPICardGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductThumb from '../components/ProductThumb';
import FormField, { FormInput, FormSelect, FormNumber, FormTextarea } from '../components/FormField';

const createEntryForm = (itemId = '') => ({ itemId, quantidade: '', data: todayISO(), observacao: '' });

// Zerados primeiro, depois os de estoque baixo
const byUrgency = (a, b) => Number(b.tipoAlerta === 'zerado') - Number(a.tipoAlerta === 'zerado');

async function fetchDashboard() {
  const [alertas, itensPage] = await Promise.all([
    alertaService.listar(),
    itemService.listar({ size: 1000, ativo: true }),
  ]);
  return { alertas: [...alertas].sort(byUrgency), itens: itensPage.content ?? [] };
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function computeStats(itens) {
  const zerados = itens.filter((i) => i.quantidadeAtual === 0).length;
  const baixos = itens.filter((i) => i.quantidadeAtual > 0 && i.quantidadeAtual < i.quantidadeMinima).length;
  return { total: itens.length, ok: itens.length - zerados - baixos, alerta: zerados + baixos, zerados };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const [entryForm, setEntryForm] = useState(null); // null = modal fechado
  const [entryErrors, setEntryErrors] = useState({});
  const [savingEntry, setSavingEntry] = useState(false);

  const { data, loading, reload: loadDashboard } = useApiData(fetchDashboard, { alertas: [], itens: [] });
  const { alertas, itens } = data;

  const canRegisterEntry = hasPermission('REGISTRAR_ENTRADA');
  const itemsWithPhoto = new Set(itens.filter((i) => i.imagem?.url).map((i) => i.id));
  const stats = computeStats(itens);

  const openEntry = (itemId = '') => {
    setEntryErrors({});
    setEntryForm(createEntryForm(itemId));
  };
  const setEntryField = (field, value) => setEntryForm((prev) => ({ ...prev, [field]: value }));

  const handleConfirmEntry = async () => {
    const errors = {
      itemId: !entryForm.itemId,
      quantidade: !entryForm.quantidade || parseInt(entryForm.quantidade, 10) <= 0,
    };
    setEntryErrors(errors);
    if (errors.itemId || errors.quantidade) return;

    setSavingEntry(true);
    try {
      await movimentacaoService.registrar({
        itemId: parseInt(entryForm.itemId, 10),
        tipo: 'entrada',
        quantidade: parseInt(entryForm.quantidade, 10),
        data: entryForm.data,
        observacao: entryForm.observacao,
      });
      setEntryForm(null);
      showApiSuccess('Entrada registrada com sucesso!');
      loadDashboard();
    } catch (error) {
      showApiError(error);
    } finally {
      setSavingEntry(false);
    }
  };

  if (loading) return <LoadingSpinner message="Carregando dashboard..." />;

  const kpiCards = [
    { label: 'Produtos ativos', value: stats.total, icon: Boxes, tone: 'primary', description: 'no catálogo' },
    { label: 'Estoque OK', value: stats.ok, icon: PackageCheck, tone: 'success', description: 'acima do mínimo' },
    { label: 'Em alerta', value: stats.alerta, icon: AlertTriangle, tone: 'warning', description: 'abaixo do mínimo' },
    { label: 'Zerados', value: stats.zerados, icon: PackageX, tone: 'danger', description: 'sem estoque' },
  ];

  const alertColumns = [
    {
      header: 'Produto',
      primary: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <ProductThumb size={36} src={itemsWithPhoto.has(row.itemId) ? imagemProdutoService.url(row.itemId, 'icon') : null} alt={row.itemNome} />
          <span className="font-medium text-navy">{row.itemNome}</span>
        </div>
      ),
    },
    { header: 'Atual', accessor: 'quantidadeAtual', numeric: true, bold: true },
    { header: 'Mínimo', accessor: 'quantidadeMinima', numeric: true },
    { header: 'Status', render: (row) => <StatusBadge status={row.tipoAlerta} /> },
    ...(canRegisterEntry ? [{
      header: 'Ações', align: 'right',
      render: (row) => (
        <Button variant="ghost-primary" size="sm" onClick={() => openEntry(String(row.itemId))}>
          <Plus className="h-3.5 w-3.5" /> Entrada
        </Button>
      ),
    }] : []),
  ];

  const quickActions = [
    { label: 'Movimentar estoque', Icon: ArrowLeftRight, to: '/movements', permissions: ['REGISTRAR_ENTRADA', 'REGISTRAR_SAIDA'] },
    { label: 'Cadastrar produto', Icon: PackagePlus, to: '/products', permissions: ['CADASTRAR_ITENS'] },
    { label: 'Ver relatórios', Icon: FileText, to: '/reports', permissions: ['VER_RELATORIOS'] },
  ].filter((action) => action.permissions.some(hasPermission));

  const banner = alertas.length > 0 && (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-warning-strong/30 bg-warning-soft px-4 py-3">
      <p className="flex items-center gap-2 text-sm font-medium text-warning">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        {alertas.length} {alertas.length === 1 ? 'produto está' : 'produtos estão'} com estoque abaixo do mínimo
      </p>
      <Button variant="ghost-warning" size="sm" onClick={() => navigate('/products', { state: { filterByAlert: true } })}>
        Ver produtos em alerta
      </Button>
    </div>
  );

  return (
    <PageLayout
      title={`${greeting()}, ${user?.nome?.split(' ')[0] ?? ''}`}
      documentTitle="Dashboard"
      description="Resumo do estoque agora."
      banner={banner}
      actions={
        <>
          {quickActions.map(({ label, Icon, to }) => (
            <Button key={label} variant="outline" onClick={() => navigate(to)}>
              <Icon className="h-4 w-4" /> {label}
            </Button>
          ))}
          {canRegisterEntry && (
            <Button onClick={() => openEntry()}><Plus className="h-4 w-4" /> Registrar entrada</Button>
          )}
        </>
      }
    >
      <KPICardGrid cards={kpiCards} />

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-base font-semibold text-navy">Produtos que precisam de atenção</h2>
          {alertas.length > 0 && <span className="numeric text-sm text-body">{alertas.length} itens</span>}
        </div>
        <DataTable
          columns={alertColumns}
          data={alertas}
          rowKey="itemId"
          empty={{ icon: PackageCheck, title: 'Tudo em ordem', description: 'Nenhum produto está abaixo do estoque mínimo.' }}
        />
      </section>

      <Modal open={Boolean(entryForm)} onClose={() => setEntryForm(null)} title="Registrar entrada de produto" className="max-w-2xl">
        {entryForm && (
          <div className="space-y-4">
            <FormField label="Produto" error={entryErrors.itemId}>
              <FormSelect value={entryForm.itemId} onChange={(e) => setEntryField('itemId', e.target.value)}>
                <option value="">Selecione um produto</option>
                {itens.map((p) => <option key={p.id} value={p.id}>{p.nome} (Estoque: {p.quantidadeAtual})</option>)}
              </FormSelect>
            </FormField>
            <FormField label="Quantidade" error={entryErrors.quantidade}>
              <FormNumber value={entryForm.quantidade} onChange={(e) => setEntryField('quantidade', e.target.value)} placeholder="0" />
            </FormField>
            <FormField label="Data">
              <FormInput type="date" value={entryForm.data} max={todayISO()} onChange={(e) => setEntryField('data', e.target.value)} />
            </FormField>
            <FormField label="Observação">
              <FormTextarea value={entryForm.observacao} onChange={(e) => setEntryField('observacao', e.target.value)} rows={3} />
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEntryForm(null)} disabled={savingEntry}>Cancelar</Button>
              <Button onClick={handleConfirmEntry} disabled={savingEntry}>{savingEntry ? 'Salvando...' : 'Confirmar'}</Button>
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}
