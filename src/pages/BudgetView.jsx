import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Printer, Package, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { orcamentoService } from '../services/orcamentoService';
import { formatDate, formatCurrency } from '../lib/formatters';
import { showApiError, showApiSuccess } from '../lib/apiError';
import { cn } from '../lib/utils';
import PageLayout from '../components/PageLayout';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';

const ACTIONS = {
  aceitar: {
    run: orcamentoService.aceitar,
    success: 'Orçamento aceito com sucesso! Encomendas geradas.',
    title: 'Aceitar orçamento',
    message: 'Aceitar este orçamento? Isso gerará encomendas para os itens.',
    label: 'Aceitar',
    variant: 'default',
  },
  rejeitar: {
    run: orcamentoService.rejeitar,
    success: 'Orçamento rejeitado com sucesso!',
    title: 'Rejeitar orçamento',
    message: 'Tem certeza que deseja rejeitar este orçamento?',
    label: 'Rejeitar',
    variant: 'destructive',
  },
};

const STATUS_NOTICE = {
  ACEITO: {
    Icon: CheckCircle,
    className: 'border-success/25 bg-success-soft text-success',
    title: 'Orçamento aceito',
    body: <>Este orçamento gerou encomendas. <Link to="/orders" className="font-semibold text-primary underline">Ver encomendas</Link></>,
  },
  REJEITADO: { Icon: XCircle, className: 'border-danger/25 bg-danger-soft text-danger-strong', title: 'Orçamento rejeitado' },
  CONCLUIDO: { Icon: CheckCircle, className: 'border-primary/25 bg-primary-soft text-primary', title: 'Orçamento concluído' },
};

function Info({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-body">{label}</p>
      <div className="mt-1 text-sm text-navy">{children}</div>
    </div>
  );
}

export default function BudgetView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    orcamentoService.buscarPorId(id)
      .then(setBudget)
      .catch((err) => {
        showApiError(err);
        navigate('/budgets', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const confirmAction = async () => {
    const action = ACTIONS[pendingAction];
    try {
      await action.run(id);
      showApiSuccess(action.success);
      setBudget(await orcamentoService.buscarPorId(id));
    } catch (err) {
      showApiError(err);
    } finally {
      setPendingAction(null);
    }
  };

  if (loading) return <LoadingSpinner message="Carregando orçamento..." />;
  if (!budget) return null;

  const notice = STATUS_NOTICE[budget.status];
  const action = pendingAction && ACTIONS[pendingAction];

  return (
    <PageLayout
      title={`Orçamento #${budget.id}`}
      description={budget.cliente?.nome}
      actions={
        <>
          <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Imprimir</Button>
          <Button variant="ghost-primary" onClick={() => navigate('/budgets')}><ArrowLeft className="h-4 w-4" /> Voltar</Button>
        </>
      }
    >
      <div className="space-y-6">
        <section className="card p-5">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-body">Orçamento</span>
              <p className="mt-1 text-2xl font-extrabold text-navy">#{budget.id}</p>
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge status={budget.status} />
              <span className="text-sm text-body">Criado em {formatDate(budget.criadoEm)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-line pt-4 md:grid-cols-3">
            <Info label="Cliente">
              <span className="flex items-center gap-2 font-medium"><User className="h-4 w-4 text-body" />{budget.cliente?.nome || '—'}</span>
            </Info>
            <Info label="Telefone">{budget.cliente?.telefone || '—'}</Info>
            <Info label="Total"><span className="text-xl font-extrabold">{formatCurrency(budget.valorTotal)}</span></Info>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-4 text-sm font-bold text-navy">Itens do orçamento</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-navy">
              <thead>
                <tr className="bg-input text-xs font-semibold uppercase">
                  <th scope="col" className="px-4 py-3 text-left">Produto / Serviço</th>
                  <th scope="col" className="px-4 py-3 text-center">Qtd</th>
                  <th scope="col" className="px-4 py-3 text-right">Preço unit.</th>
                  <th scope="col" className="px-4 py-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {budget.itens?.map((item, index) => (
                  <tr key={item.id ?? index} className="border-t border-line">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2"><Package className="h-4 w-4 text-body" />{item.descricao || item.item?.nome}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-medium">{item.quantidade}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.precoUnitario)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency((item.precoUnitario || 0) * (item.quantidade || 0))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-input">
                  <td colSpan={3} className="px-4 py-3 text-right font-semibold">Total</td>
                  <td className="px-4 py-3 text-right text-base font-extrabold">{formatCurrency(budget.valorTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {budget.observacao && (
          <section className="card p-5">
            <h2 className="mb-3 text-sm font-bold text-navy">Observação</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-navy">{budget.observacao}</p>
          </section>
        )}

        {budget.status === 'PENDENTE' && (
          <div className="flex justify-end gap-3 rounded-[var(--radius-card)] border border-line bg-input p-4 print:hidden">
            <Button variant="outline-danger" onClick={() => setPendingAction('rejeitar')}><XCircle className="h-4 w-4" /> Rejeitar</Button>
            <Button className="bg-success hover:bg-success/90" onClick={() => setPendingAction('aceitar')}><CheckCircle className="h-4 w-4" /> Aceitar</Button>
          </div>
        )}

        {notice && (
          <div className={cn('flex items-center gap-3 rounded-[var(--radius-card)] border p-4', notice.className)}>
            <notice.Icon className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">{notice.title}</p>
              {notice.body && <p className="text-xs text-ink">{notice.body}</p>}
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(action)}
        onClose={() => setPendingAction(null)}
        onConfirm={confirmAction}
        title={action?.title}
        message={action?.message}
        confirmLabel={action?.label}
        confirmVariant={action?.variant}
      />
    </PageLayout>
  );
}
