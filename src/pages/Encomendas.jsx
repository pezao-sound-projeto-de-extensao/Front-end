import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Truck, CheckCircle, Package } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { encomendaService } from '../services/encomendaService';
import PageLayout from '../components/PageLayout';
import SearchBar from '../components/SearchBar';
import FilterSelect from '../components/FilterSelect';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import ReceberEncomendaModal from '../components/ReceberEncomendaModal';
import KPICardGrid from '../components/KPICardGrid';
import { formatDate } from '../lib/formatters';
import { showApiError, showApiSuccess } from '../lib/apiError.jsx';
import { useAuth } from '../context/AuthContext';

const statusVariants = {
  PENDENTE: { bg: '#fff3cd', color: '#856404' },
  RECEBIDA: { bg: '#cce5ff', color: '#004085' },
  CONCLUIDA: { bg: '#d4edda', color: '#155724' },
};

function SkeletonKPI() {
  return (
    <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', boxShadow: 'var(--shadow-card)' }}>
      <div className="animate-pulse">
        <div className="h-4 w-3/4 rounded" style={{ backgroundColor: '#e0e0e0' }} />
        <div className="h-8 w-1/2 rounded mt-2" style={{ backgroundColor: '#e0e0e0' }} />
        <div className="h-3 w-1/3 rounded mt-2" style={{ backgroundColor: '#e0e0e0' }} />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="animate-pulse">
      <div className="h-10 w-10 rounded" style={{ backgroundColor: '#e0e0e0' }} />
    </div>
  );
}

export default function Encomendas() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('GERENCIAR_ENCOMENDAS');

  const [encomendas, setEncomendas] = useState([]);
  const [kpis, setKpis] = useState({ pendentes: 0, recebidas: 0, concluidasNoMes: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingKpis, setLoadingKpis] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [receberModal, setReceberModal] = useState({ open: false, encomenda: null });

  const loadEncomendas = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, size: pageSize };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'Todos') params.status = statusFilter;
      const response = await encomendaService.listar(params);
      setEncomendas(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error('Erro ao carregar encomendas:', err);
      showApiError(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, statusFilter]);

  const loadKpis = useCallback(async () => {
    setLoadingKpis(true);
    try {
      const data = await encomendaService.kpis();
      setKpis(data);
    } catch (err) {
      console.error('Erro ao carregar KPIs:', err);
    } finally {
      setLoadingKpis(false);
    }
  }, []);

  useEffect(() => {
    loadEncomendas();
    loadKpis();
  }, [loadEncomendas, loadKpis]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(0);
  };

  const handleReceber = (encomenda) => {
    setReceberModal({ open: true, encomenda });
  };

  const handleReceberConfirm = async (id, itemId) => {
    try {
      await encomendaService.receber(id, itemId);
      showApiSuccess('Encomenda recebida com sucesso!');
      loadEncomendas();
      loadKpis();
    } catch (err) {
      showApiError(err);
      throw err;
    }
  };

  const handleConcluir = async (id) => {
    try {
      await encomendaService.concluir(id);
      showApiSuccess('Encomenda concluída com sucesso!');
      loadEncomendas();
      loadKpis();
    } catch (err) {
      showApiError(err);
    }
  };

  const columns = [
    {
      header: 'Foto',
      accessor: 'fotoUrl',
      width: '64px',
      render: (row) => row.fotoUrl ? (
        <img src={row.fotoUrl} alt={row.descricao} className="rounded-lg object-cover" style={{ width: '44px', height: '44px', border: '1.5px solid #d0dde8' }} />
      ) : (
        <div className="rounded-lg flex items-center justify-center" style={{ width: '44px', height: '44px', backgroundColor: '#e2eaf3', border: '1.5px dashed #c0d0df' }}>
          <Package style={{ width: '18px', height: '18px', color: '#6a92b0' }} />
        </div>
      ),
    },
    { header: 'Item', accessor: 'descricao' },
    { header: 'Cliente', accessor: 'clienteNome' },
    { header: 'Qtd', accessor: 'quantidade', align: 'center', width: '60px' },
    {
      header: 'Orçamento',
      accessor: 'orcamentoId',
      width: '100px',
      align: 'center',
      render: (row) => <span style={{ fontWeight: '500', color: '#1565c0' }}>#{row.orcamentoId}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '130px',
      render: (row) => <StatusBadge status={row.status} variants={statusVariants} />,
    },
    {
      header: 'Data',
      accessor: 'criadoEm',
      width: '160px',
      render: (row) => formatDate(row.criadoEm),
    },
    {
      header: 'Ações',
      align: 'right',
      width: '160px',
      render: (row) => {
        if (!canManage) return <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Sem permissão</span>;
        return (
          <div className="flex justify-end gap-2">
            {row.status === 'PENDENTE' && (
              <Button variant="default" size="sm" onClick={() => handleReceber(row)} style={{ fontSize: '12px', fontWeight: 'bold', backgroundColor: '#f59e0b', color: '#fff', borderRadius: '6px' }}>
                <Truck className="w-3 h-3 mr-1" /> Receber
              </Button>
            )}
            {row.status === 'RECEBIDA' && (
              <Button variant="default" size="sm" onClick={() => handleConcluir(row.id)} style={{ fontSize: '12px', fontWeight: 'bold', backgroundColor: '#1565c0', color: '#fff', borderRadius: '6px' }}>
                <CheckCircle className="w-3 h-3 mr-1" /> Concluir
              </Button>
            )}
            {row.status === 'CONCLUIDA' && (
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Concluída</span>
            )}
          </div>
        );
      },
    },
  ];

  const statusOptions = [
    { value: 'Todos', label: 'Todos' },
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'RECEBIDA', label: 'Recebida' },
    { value: 'CONCLUIDA', label: 'Concluída' },
  ];

  const kpiCardsData = [
    { label: 'Pendentes', value: kpis.pendentes ?? 0, color: '#856404', description: 'Aguardando fornecedor' },
    { label: 'Recebidas', value: kpis.recebidas ?? 0, color: '#004085', description: 'No estoque, aguardando entrega' },
    { label: 'Concluídas no mês', value: kpis.concluidasNoMes ?? 0, color: '#155724', description: 'Entregues ao cliente' },
  ];

  return (
    <PageLayout title="Encomendas" icon={ShoppingBag}>
      {!canManage && (
        <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', color: '#856404' }}>
          <strong>Sem permissão:</strong> Você não possui a permissão <code>GERENCIAR_ENCOMENDAS</code> para realizar ações (receber/concluir).
        </div>
      )}

      <div className="mb-6">
        {loadingKpis ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => <SkeletonKPI key={i} />)}
          </div>
        ) : (
          <KPICardGrid cards={kpiCardsData} />
        )}
      </div>

      <div className="flex gap-3 mb-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', boxShadow: 'var(--shadow-card)' }}>
        <SearchBar value={searchTerm} onChange={handleSearch} placeholder="Buscar por item ou cliente..." />
        <FilterSelect value={statusFilter} onChange={handleStatusChange} width="160px" options={statusOptions} />
      </div>

      <DataTable
        columns={columns}
        data={encomendas}
        loading={loading}
        emptyMessage="Nenhuma encomenda encontrada"
        skeletonRow={<SkeletonRow />}
      />

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}

      <ReceberEncomendaModal
        isOpen={receberModal.open}
        onClose={() => setReceberModal({ open: false, encomenda: null })}
        encomenda={receberModal.encomenda}
        onConfirm={handleReceberConfirm}
        hasPermission={canManage}
      />
    </PageLayout>
  );
}