import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, XCircle, Printer, Package, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { orcamentoService } from '../services/orcamentoService';
import PageLayout from '../components/PageLayout';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatCurrency } from '../lib/formatters';
import { showApiError, showApiSuccess } from '../lib/apiError.jsx';
import ConfirmModal from '../components/ConfirmModal';

export default function BudgetView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aceitarModal, setAceitarModal] = useState({ open: false });
  const [rejeitarModal, setRejeitarModal] = useState({ open: false });

  useEffect(() => {
    async function loadBudget() {
      try {
        setLoading(true);
        const data = await orcamentoService.buscarPorId(id);
        setBudget(data);
      } catch (err) {
        console.error('Erro ao carregar orçamento:', err);
        showApiError(err);
        navigate('/budgets');
      } finally {
        setLoading(false);
      }
    }
    loadBudget();
  }, [id, navigate]);

  const handleAceitar = () => {
    setAceitarModal({ open: true });
  };

  const confirmAceitar = async () => {
    try {
      await orcamentoService.aceitar(id);
      showApiSuccess('Orçamento aceito com sucesso! Encomendas geradas.');
      const updated = await orcamentoService.buscarPorId(id);
      setBudget(updated);
    } catch (err) {
      showApiError(err);
    }
    setAceitarModal({ open: false });
  };

  const handleRejeitar = () => {
    setRejeitarModal({ open: true });
  };

  const confirmRejeitar = async () => {
    try {
      await orcamentoService.rejeitar(id);
      showApiSuccess('Orçamento rejeitado com sucesso!');
      const updated = await orcamentoService.buscarPorId(id);
      setBudget(updated);
    } catch (err) {
      showApiError(err);
    }
    setRejeitarModal({ open: false });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <PageLayout title="Visualizando orçamento" icon={FileText}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
            Carregando orçamento...
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!budget) {
    return (
      <PageLayout title="Orçamento não encontrado" icon={FileText}>
        <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
          Orçamento não encontrado
        </div>
      </PageLayout>
    );
  }

  const isPending = budget.status === 'PENDENTE';
  const isAccepted = budget.status === 'ACEITO';

  return (
    <PageLayout
      title={`Orçamento #${budget.id}`}
      icon={FileText}
      actions={
        <>
          <Button variant="outline" onClick={handlePrint} className="px-4 py-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--bg-card)', color: '#1a3a55', border: '1.5px solid var(--border-subtle)', fontSize: '13px', fontWeight: '700', borderRadius: '8px', boxShadow: 'var(--shadow-card)' }}>
            <Printer className="w-4 h-4" /> Imprimir
          </Button>
          <Button variant="ghost" onClick={() => navigate('/budgets')} className="px-4 py-2 rounded-lg flex items-center gap-2" style={{ color: '#1565c0', fontSize: '13px', fontWeight: '700', borderRadius: '8px' }}>
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="p-5 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Orçamento</span>
              <h2 className="mt-1" style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>#{budget.id}</h2>
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge status={budget.status} />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Criado em {formatDate(budget.criadoEm)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cliente</p>
              <p className="mt-1 flex items-center gap-2" style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500' }}>
                <User className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                {budget.cliente?.nome || '—'}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Telefone</p>
              <p className="mt-1" style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{budget.cliente?.telefone || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</p>
              <p className="mt-1" style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>{formatCurrency(budget.valorTotal)}</p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>Itens do orçamento</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-input)' }}>
                  <th className="text-left py-3 px-4 uppercase" style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: '600' }}>Produto / Serviço</th>
                  <th className="text-center py-3 px-4 uppercase" style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: '600' }}>Qtd</th>
                  <th className="text-right py-3 px-4 uppercase" style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: '600' }}>Preço Unit.</th>
                  <th className="text-right py-3 px-4 uppercase" style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: '600' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {budget.itens?.map((item, index) => (
                  <tr key={index} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <td className="py-3 px-4" style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                        {item.descricao || (item.item?.nome)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center" style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{item.quantidade}</td>
                    <td className="py-3 px-4 text-right" style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{formatCurrency(item.precoUnitario)}</td>
                    <td className="py-3 px-4 text-right" style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600' }}>
                      {formatCurrency((item.precoUnitario || 0) * (item.quantidade || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: 'var(--bg-input)' }}>
                  <td colSpan={3} className="py-3 px-4 text-right" style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600' }}>Total</td>
                  <td className="py-3 px-4 text-right" style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>{formatCurrency(budget.valorTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {budget.observacao && (
          <div className="p-5 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', boxShadow: 'var(--shadow-card)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>Observação</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{budget.observacao}</p>
          </div>
        )}

        {isPending && (
          <div className="flex justify-end gap-3 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}>
            <Button variant="outline" onClick={handleRejeitar} className="px-5 py-2.5 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--bg-card)', color: '#c0392b', border: '1.5px solid #c0392b', fontSize: '13px', fontWeight: '700', borderRadius: '8px', boxShadow: 'var(--shadow-card)' }}>
              <XCircle className="w-4 h-4" /> Rejeitar
            </Button>
            <Button onClick={handleAceitar} className="px-5 py-2.5 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#1e9e5e', color: '#ffffff', fontSize: '13px', fontWeight: '700', borderRadius: '8px', boxShadow: 'var(--shadow-card)' }}>
              <CheckCircle className="w-4 h-4" /> Aceitar
            </Button>
          </div>
        )}

        {isAccepted && (
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#e6f7ef', border: '1px solid #b8e6c9', borderRadius: '10px' }}>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#1e9e5e' }} />
              <div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#1e9e5e' }}>Orçamento aceito</p>
                <p style={{ fontSize: '12px', color: '#1a3a55' }}>Este orçamento gerou encomendas. <Link to="/encomendas" style={{ color: '#1565c0', fontWeight: '600', textDecoration: 'underline' }}>Ver encomendas</Link></p>
              </div>
            </div>
          </div>
        )}

        {budget.status === 'REJEITADO' && (
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#fdeaea', border: '1px solid #f5c6c6', borderRadius: '10px' }}>
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#c0392b' }} />
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#c0392b' }}>Orçamento rejeitado</p>
            </div>
          </div>
        )}

        {budget.status === 'CONCLUIDO' && (
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#e3edf7', border: '1px solid #bcd6ee', borderRadius: '10px' }}>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#1565c0' }} />
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#1565c0' }}>Orçamento concluído</p>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={aceitarModal.open}
        onClose={() => setAceitarModal({ open: false })}
        onConfirm={confirmAceitar}
        title="Aceitar orçamento"
        message="Aceitar este orçamento? Isso gerará encomendas para os itens."
        confirmLabel="Aceitar"
        confirmVariant="default"
      />
      <ConfirmModal
        isOpen={rejeitarModal.open}
        onClose={() => setRejeitarModal({ open: false })}
        onConfirm={confirmRejeitar}
        title="Rejeitar orçamento"
        message="Tem certeza que deseja rejeitar este orçamento?"
        confirmLabel="Rejeitar"
        confirmVariant="destructive"
      />
    </PageLayout>
  );
}