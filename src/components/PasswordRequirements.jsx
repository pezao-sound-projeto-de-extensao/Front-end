import { CheckCircle, AlertCircle } from 'lucide-react';
import { PASSWORD_RULES } from '../lib/password';
import { cn } from '../lib/utils';

export default function PasswordRequirements({ password }) {
  return (
    <div className="mt-3 rounded-lg border border-line-strong bg-surface-muted p-3">
      <p className="mb-2 text-xs font-bold text-navy">Requisitos da senha:</p>
      <ul className="space-y-1">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password);
          const Icon = met ? CheckCircle : AlertCircle;
          return (
            <li key={rule.text} className={cn('flex items-center gap-2 text-xs', met ? 'text-success' : 'text-subtle')}>
              <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>{rule.text}<span className="sr-only">{met ? ' (atendido)' : ' (pendente)'}</span></span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
