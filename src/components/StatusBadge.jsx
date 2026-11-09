const TONES = {
  success: { bg: 'var(--color-success-soft)', color: 'var(--color-success)' },
  warning: { bg: 'var(--color-warning-soft)', color: 'var(--color-warning)' },
  info: { bg: 'var(--color-primary-soft)', color: 'var(--color-primary)' },
  danger: { bg: 'var(--color-danger-soft)', color: 'var(--color-danger-strong)' },
  neutral: { bg: 'var(--color-surface-muted)', color: 'var(--color-ink)' },
};

// status normalizado (minúsculo) → tom e rótulo
const DEFAULT_STATUSES = {
  ok: { tone: 'success', label: 'OK' },
  ativo: { tone: 'success', label: 'Ativo' },
  aceito: { tone: 'success', label: 'Aceito' },
  entregue: { tone: 'success', label: 'Entregue' },
  baixo: { tone: 'warning', label: 'Baixo' },
  estoque_baixo: { tone: 'warning', label: 'Estoque baixo' },
  pendente: { tone: 'warning', label: 'Pendente' },
  recebida: { tone: 'info', label: 'Recebida' },
  concluido: { tone: 'info', label: 'Concluído' },
  concluida: { tone: 'success', label: 'Concluída' },
  zerado: { tone: 'danger', label: 'Zerado' },
  inativo: { tone: 'danger', label: 'Inativo' },
  rejeitado: { tone: 'danger', label: 'Rejeitado' },
  cancelado: { tone: 'danger', label: 'Cancelado' },
};

function humanize(value) {
  const text = String(value).replaceAll('_', ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Selo de status. Status desconhecidos usam o tom neutro (nunca o verde de "ok").
 * `statuses` permite sobrescrever/estender o mapa: { RECEBIDA: { tone: 'info', label: 'Recebida' } }.
 * `label` força o texto exibido.
 */
export default function StatusBadge({ status, statuses, label, tone }) {
  if (status === null || status === undefined || status === '') return null;

  const key = String(status).toLowerCase();
  const config = statuses?.[status] ?? statuses?.[key] ?? DEFAULT_STATUSES[key];
  const style = TONES[tone ?? config?.tone ?? 'neutral'];

  return (
    <span className="badge" style={{ backgroundColor: style.bg, color: style.color }}>
      {label ?? config?.label ?? humanize(status)}
    </span>
  );
}
