const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Converte a string da API em Date no fuso local.
 * "2026-11-08" (LocalDate) seria lido como meia-noite UTC pelo `new Date`,
 * o que no Brasil vira o dia anterior.
 */
function parseApiDate(value) {
  const match = typeof value === 'string' && DATE_ONLY.exec(value);
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return new Date(value);
}

/** Data no formato yyyy-MM-dd no fuso local (toISOString usaria UTC e viraria o dia após 21h). */
export function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayISO() {
  return toISODate(new Date());
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  const date = parseApiDate(dateString);
  if (isNaN(date.getTime())) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateTime(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

/** Iniciais do nome para avatares: "Ana Maria Souza" → "AS". */
export function initials(nome = '') {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts.at(-1)[0] : '')).toUpperCase() || '?';
}
