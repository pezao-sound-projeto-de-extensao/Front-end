import { useCallback, useState } from 'react';
import { AlertTriangle, Boxes, PackageCheck, PackageX, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '../components/ui/Button';
import { relatorioService } from '../services/relatorioService';
import { categoriaService } from '../services/categoriaService';
import { formatDate, toISODate } from '../lib/formatters';
import useApiData from '../hooks/useApiData';
import PageLayout from '../components/PageLayout';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import KPICardGrid from '../components/KPICardGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import FormField, { FormInput, FormSelect } from '../components/FormField';
import { MovementQuantity, MovementTypeBadge } from '../components/MovementType';
import { isEntrada } from '../lib/movimentacao';

const PERIODS = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Últimos 7 dias' },
  { value: 'mes', label: 'Este mês' },
  { value: 'personalizado', label: 'Personalizado' },
];

const CHART_COLORS = { entrada: 'var(--color-primary)', saida: 'var(--color-danger)' };

function rangeFor(period) {
  const today = new Date();
  const start = new Date(today);
  if (period === 'semana') start.setDate(today.getDate() - 6);
  if (period === 'mes') start.setDate(1);
  return { start: toISODate(start), end: toISODate(today) };
}

function Card({ title, aside, children }) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-sm font-semibold text-navy">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export default function Reports() {
  const [period, setPeriod] = useState('mes');
  const [customRange, setCustomRange] = useState(() => rangeFor('mes'));
  const [categoriaId, setCategoriaId] = useState('');
  const { start, end } = period === 'personalizado' ? customRange : rangeFor(period);

  const fetchReport = useCallback(() => relatorioService.buscar({
    dataInicio: start,
    dataFim: end,
    categoriaId: categoriaId || undefined,
    page: 0,
    size: 500,
  }), [start, end, categoriaId]);

  const { data: categorias } = useApiData(categoriaService.listar, []);
  const { data: report, loading } = useApiData(fetchReport, null);

  const changeDate = (field) => (e) => {
    setCustomRange({ start, end, [field]: e.target.value });
    setPeriod('personalizado');
  };

  const kpis = report?.kpis ?? {};
  const criticos = report?.itensCriticos ?? [];
  const maisMovimentados = report?.maisMovimentados ?? [];
  const historico = report?.historico?.content ?? report?.historico ?? [];

  const entradas = historico.filter((m) => isEntrada(m.tipo)).length;
  const porTipo = [
    { name: 'Entradas', value: entradas, color: CHART_COLORS.entrada },
    { name: 'Saídas', value: historico.length - entradas, color: CHART_COLORS.saida },
  ];
  const porCategoria = categorias
    .map((cat) => ({ name: cat.nome, movimentações: historico.filter((m) => m.categoriaNome === cat.nome).length }))
    .filter((row) => row.movimentações > 0);
  const maxMovimentos = Math.max(1, ...maisMovimentados.map((p) => p.totalMovimentacoes));
  const zerados = criticos.filter((p) => p.status?.toLowerCase() === 'zerado').length;

  const kpiCards = [
    { label: 'Total em estoque', value: kpis.totalItens ?? 0, icon: Boxes, tone: 'primary', description: 'produtos diferentes' },
    { label: 'Produtos OK', value: kpis.itensOk ?? 0, icon: PackageCheck, tone: 'success', description: 'dentro do mínimo' },
    { label: 'Produtos em alerta', value: kpis.itensAlerta ?? 0, icon: AlertTriangle, tone: 'warning', description: 'abaixo do mínimo' },
    { label: 'Produtos zerados', value: kpis.itensZerados ?? 0, icon: PackageX, tone: 'danger', description: 'sem estoque' },
  ];

  const criticalColumns = [
    { header: 'Produto', accessor: 'nome' },
    { header: 'Qtd', accessor: 'quantidadeAtual', numeric: true, bold: true },
    { header: 'Mínimo', accessor: 'quantidadeMinima', numeric: true },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  const movementColumns = [
    { header: 'Data', render: (row) => formatDate(row.data) },
    { header: 'Produto', accessor: 'itemNome' },
    { header: 'Categoria', render: (row) => row.categoriaNome || '—' },
    { header: 'Tipo', render: (row) => <MovementTypeBadge tipo={row.tipo} /> },
    { header: 'Quantidade', render: (row) => <MovementQuantity tipo={row.tipo} quantidade={row.quantidade} /> },
    { header: 'Antes', accessor: 'estoqueAntes', numeric: true },
    { header: 'Depois', accessor: 'estoqueDepois', numeric: true, bold: true },
    { header: 'Observação', render: (row) => row.observacao || '—' },
  ];

  return (
    <PageLayout
      title="Relatórios"
      description="Situação do estoque e movimentações no período escolhido."
      actions={
        <Button variant="outline" onClick={() => window.print()} title="Use 'Salvar como PDF' na janela de impressão">
          <Printer className="h-4 w-4" /> Imprimir / PDF
        </Button>
      }
    >
      <div className="card mb-6 grid grid-cols-1 items-end gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
        <FormField label="Período">
          <FormSelect value={period} onChange={(e) => setPeriod(e.target.value)}>
            {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </FormSelect>
        </FormField>
        <FormField label="De">
          <FormInput type="date" value={start} max={end} onChange={changeDate('start')} />
        </FormField>
        <FormField label="Até">
          <FormInput type="date" value={end} min={start} onChange={changeDate('end')} />
        </FormField>
        <FormField label="Categoria">
          <FormSelect value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
            <option value="">Todas</option>
            {categorias.map((cat) => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
          </FormSelect>
        </FormField>
      </div>

      {loading ? <LoadingSpinner message="Carregando relatório..." /> : (
        <>
          <KPICardGrid cards={kpiCards} />

          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-sm font-semibold text-navy">Produtos com estoque crítico</h2>
                <StatusBadge status="zerado" label={`${zerados} zerados`} />
              </div>
              <DataTable columns={criticalColumns} data={criticos} rowKey="nome" emptyMessage="Nenhum produto crítico" />
            </div>

            <Card title="Produtos mais movimentados" aside={<span className="text-xs text-body">no período</span>}>
              {maisMovimentados.length === 0 ? (
                <p className="text-sm text-muted">Nenhuma movimentação no período</p>
              ) : (
                <ul className="space-y-4">
                  {maisMovimentados.map((product) => (
                    <li key={product.nome}>
                      <div className="mb-2 flex items-center justify-between text-sm text-ink">
                        <span className="font-medium">{product.nome}</span>
                        <span className="font-bold">{product.totalMovimentacoes}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(product.totalMovimentacoes / maxMovimentos) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title="Movimentações por tipo">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={porTipo} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {porTipo.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'movimentações']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card title="Movimentações por categoria">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={porCategoria}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="movimentações" fill={CHART_COLORS.entrada} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-navy">Histórico completo de movimentações no período</h2>
            <DataTable
              columns={movementColumns}
              data={historico.map((m, i) => ({ ...m, rowId: i }))}
              rowKey="rowId"
              emptyMessage="Nenhuma movimentação no período"
            />
          </section>
        </>
      )}
    </PageLayout>
  );
}
