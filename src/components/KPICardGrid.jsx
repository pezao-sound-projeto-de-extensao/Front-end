import { cn } from '../lib/utils';

const COLUMNS = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' };

const TONES = {
  neutral: { icon: 'bg-surface-muted text-ink', value: 'text-navy' },
  primary: { icon: 'bg-primary-soft text-primary', value: 'text-navy' },
  success: { icon: 'bg-success-soft text-success', value: 'text-success' },
  warning: { icon: 'bg-warning-soft text-warning', value: 'text-warning' },
  danger: { icon: 'bg-danger-soft text-danger', value: 'text-danger' },
};

/** cards: [{ label, value, description?, icon?, tone? }] */
export default function KPICardGrid({ cards }) {
  return (
    <div className={cn('mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2', COLUMNS[cards.length] ?? 'lg:grid-cols-4')}>
      {cards.map(({ label, value, description, icon: Icon, tone = 'neutral' }) => {
        const styles = TONES[tone] ?? TONES.neutral;
        return (
          <div key={label} className="card flex items-start gap-4 p-5 transition-shadow hover:shadow-[var(--shadow-card-hover)]">
            {Icon && (
              <div className={cn('flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl', styles.icon)}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-body">{label}</p>
              <p className={cn('numeric mt-1 text-3xl font-bold tracking-tight', styles.value)}>{value}</p>
              {description && <p className="mt-0.5 text-xs text-subtle">{description}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function KPICardGridSkeleton({ count = 4 }) {
  return (
    <div className={cn('mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2', COLUMNS[count] ?? 'lg:grid-cols-4')}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card flex gap-4 p-5">
          <div className="skeleton h-11 w-11 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-8 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
