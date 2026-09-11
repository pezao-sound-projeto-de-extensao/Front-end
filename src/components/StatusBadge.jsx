export default function StatusBadge({ status, variants = {} }) {
  const defaultVariants = {
    ok: { bg: '#e6f7ef', color: '#1e9e5e' },
    ativo: { bg: '#e6f7ef', color: '#1e9e5e' },
    entregue: { bg: '#e6f7ef', color: '#1e9e5e' },
    aprovado: { bg: '#e6f7ef', color: '#1e9e5e' },
    baixo: { bg: '#fff4e0', color: '#b86200' },
    estoque_baixo: { bg: '#fff4e0', color: '#b86200' },
    pendente: { bg: '#fff4e0', color: '#b86200' },
    em_transito: { bg: '#eaf2fb', color: '#1565c0' },
    zerado: { bg: '#fdeaea', color: '#c0392b' },
    inativo: { bg: '#fdeaea', color: '#c0392b' },
    recusado: { bg: '#fdeaea', color: '#c0392b' },
    cancelado: { bg: '#fdeaea', color: '#c0392b' },
  };

  const allVariants = { ...defaultVariants, ...variants };
  const style = allVariants[status?.toLowerCase()] || allVariants.ok;
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ') : '';

  return (
    <span className="px-2 py-1 rounded" style={{ backgroundColor: style.bg, color: style.color, fontWeight: 'bold', fontSize: '11px', borderRadius: '5px' }}>
      {label}
    </span>
  );
}
