import { cn } from '../lib/utils';
import { isEntrada } from '../lib/movimentacao';

/** Selo "+ Entrada" / "− Saída". */
export function MovementTypeBadge({ tipo }) {
  const entrada = isEntrada(tipo);
  return (
    <span className={cn('badge', entrada ? 'bg-primary-soft text-primary' : 'bg-danger-soft text-danger-strong')}>
      {entrada ? '+ Entrada' : '− Saída'}
    </span>
  );
}

/** Quantidade com sinal e cor do tipo. */
export function MovementQuantity({ tipo, quantidade }) {
  const entrada = isEntrada(tipo);
  return (
    <span className={cn('font-bold', entrada ? 'text-primary' : 'text-danger-strong')}>
      {entrada ? '+' : '−'}{quantidade}
    </span>
  );
}
