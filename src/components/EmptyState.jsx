import { Inbox } from 'lucide-react';

/** Mensagem para listas vazias: ícone, título, explicação e uma ação opcional. */
export default function EmptyState({ icon: Icon = Inbox, title = 'Nada por aqui ainda', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
        <Icon className="h-6 w-6 text-subtle" aria-hidden="true" />
      </div>
      <p className="text-base font-semibold text-navy">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-body">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
