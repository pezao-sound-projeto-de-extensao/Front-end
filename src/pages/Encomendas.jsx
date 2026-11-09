import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, ShoppingBag, Truck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { encomendaService } from '../services/encomendaService';
import { imagemProdutoService } from '../services/itemService';
import { formatDate } from '../lib/formatters';
import { showApiError, showApiSuccess } from '../lib/apiError';
import useDebouncedValue from '../hooks/useDebouncedValue';
import useApiData, { EMPTY_PAGE } from '../hooks/useApiData';
import PageLayout from '../components/PageLayout';
import SearchBar from '../components/SearchBar';
import FilterSelect from '../components/FilterSelect';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import ReceberEncomendaModal from '../components/ReceberEncomendaModal';
import KPICardGrid, { KPICardGridSkeleton } from '../components/KPICardGrid';
import ProductThumb from '../components/ProductThumb';

const PAGE_SIZE = 10;

const STATUS = {
  PENDENTE: { tone: 'warning', label: 'Pendente' },
  RECEBIDA: { tone: 'info', label: 'Recebida' },
  CONCLUIDA: { tone: 'success', label: 'Concluída' },
};

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  ...Object.entries(STATUS).map(([value, { label }]) => ({ value, label })),
];

// A rota já exige GERENCIAR_ENCOMENDAS, então quem está aqui pode receber e concluir.
export default function Encomendas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [receberTarget, setReceberTarget] = useState(null);

  const debouncedSearch = useDebouncedValue(searchTerm);

  const fetchEncomendas = useCallback(() => encomendaService.listar({
    page: currentPage,
    size: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
  }), [currentPage, debouncedSearch, statusFilter]);

  const { data: page, loading, reload: loadEncomendas } = useApiData(fetchEncomendas, EMPTY_PAGE);
  const { data: kpis, reload: loadKpis } = useApiData(encomendaService.kpis, null);
  const encomendas = page.content ?? [];
  const totalPages = page.totalPages || 1;

  const refresh = () => Promise.all([loadEncomendas(), loadKpis()]);

  const handleReceber = async (id, itemId) => {
    try {
      await encomendaService.receber(id, itemId);
      showApiSuccess('Encomenda recebida com sucesso!');
      refresh();
    } catch (err) {
      showApiError(err);
      throw err;
    }
  };

  const handleConcluir = async (id) => {
    try {
      await encomendaService.concluir(id);
      showApiSuccess('Encomenda concluída com sucesso!');
      refresh();
    } catch (err) {
      showApiError(err);
    }
  };

  const columns = [
    {
      header: 'Item',
      primary: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <ProductThumb size={40} src={row.itemId && row.fotoUrl ? imagemProdutoService.url(row.itemId, 'icon') : null} alt={row.descricao} />
          <div className="min-w-0">
            <p className="truncate font-medium text-navy">{row.descricao}</p>
            <p className="truncate text-xs text-subtle">{row.clienteNome}</p>
          </div>
        </div>
      ),
    },
    { header: 'Qtd', accessor: 'quantidade', numeric: true, bold: true, width: '80px' },
    {
      header: 'Orçamento', width: '110px',
      render: (row) => <Link to={`/budgets/${row.orcamentoId}`} className="numeric font-medium text-primary hover:underline">#{row.orcamentoId}</Link>,
    },
    { header: 'Status', width: '130px', render: (row) => <StatusBadge status={row.status} statuses={STATUS} /> },
    { header: 'Criada em', width: '130px', render: (row) => <span className="numeric">{formatDate(row.criadoEm)}</span> },
    {
      header: 'Ações', align: 'right', width: '150px',
      render: (row) => (
        <>
          {row.status === 'PENDENTE' && (
            <Button variant="warning" size="sm" onClick={() => setReceberTarget(row)}>
              <Truck className="h-3.5 w-3.5" /> Receber
            </Button>
          )}
          {row.status === 'RECEBIDA' && (
            <Button size="sm" onClick={() => handleConcluir(row.id)}>
              <CheckCircle className="h-3.5 w-3.5" /> Concluir
            </Button>
          )}
        </>
      ),
    },
  ];

  const kpiCards = kpis && [
    { label: 'Pendentes', value: kpis.pendentes ?? 0, icon: Clock, tone: 'warning', description: 'Aguardando fornecedor' },
    { label: 'Recebidas', value: kpis.recebidas ?? 0, icon: Truck, tone: 'primary', description: 'No estoque, aguardando entrega' },
    { label: 'Concluídas no mês', value: kpis.concluidasNoMes ?? 0, icon: CheckCircle, tone: 'success', description: 'Entregues ao cliente' },
  ];

  return (
    <PageLayout title="Encomendas" description="Itens de orçamentos aceitos, do pedido ao fornecedor até a entrega ao cliente.">
      {kpiCards ? <KPICardGrid cards={kpiCards} /> : <KPICardGridSkeleton count={3} />}

      <div className="toolbar">
        <SearchBar value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }} placeholder="Buscar por item ou cliente..." />
        <FilterSelect label="Status" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }} options={STATUS_OPTIONS} />
      </div>

      <DataTable
        columns={columns}
        data={encomendas}
        loading={loading}
        empty={{ icon: ShoppingBag, title: 'Nenhuma encomenda encontrada', description: searchTerm || statusFilter ? 'Tente outra busca ou ajuste o filtro de status.' : 'As encomendas aparecem aqui quando um orçamento é aceito.' }}
      />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <ReceberEncomendaModal encomenda={receberTarget} onClose={() => setReceberTarget(null)} onConfirm={handleReceber} />
    </PageLayout>
  );
}
